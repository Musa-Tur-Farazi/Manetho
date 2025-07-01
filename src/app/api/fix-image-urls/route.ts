import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting image URL fix (preview -> view)...');

    // Get all threads with images
    const result = await db.execute(sql`
      SELECT thread_id, images
      FROM threads 
      WHERE images IS NOT NULL 
      AND jsonb_array_length(images) > 0
    `);

    console.log(`Found ${result.rows.length} threads with images to fix`);

    let updatedCount = 0;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;

    for (const row of result.rows) {
      const threadId = row.thread_id;
      let images;

      try {
        images = typeof row.images === 'string' ? JSON.parse(row.images) : row.images;
      } catch (e) {
        console.error(`Failed to parse images for thread ${threadId}:`, e);
        continue;
      }

      if (!Array.isArray(images)) continue;

      let hasChanges = false;
      const fixedImages = images.map(url => {
        if (typeof url !== 'string') return url;

        // Extract file ID from various URL formats
        let fileId = null;

        // Pattern 1: /files/{fileId}/preview or /files/{fileId}/view
        const fileIdMatch = url.match(/\/files\/([a-zA-Z0-9]+)\/(preview|view)/);
        if (fileIdMatch) {
          fileId = fileIdMatch[1];
        }

        if (fileId) {
          // Create the correct URL format using /view instead of /preview
          const correctUrl = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;

          if (url !== correctUrl) {
            console.log(`Fixing URL for thread ${threadId}:`);
            console.log(`  Old: ${url}`);
            console.log(`  New: ${correctUrl}`);
            hasChanges = true;
            return correctUrl;
          }
        } else {
          console.warn(`Could not extract file ID from URL: ${url}`);
        }

        return url;
      });

      if (hasChanges) {
        // Update the database
        await db.execute(sql`
          UPDATE threads 
          SET images = ${JSON.stringify(fixedImages)}
          WHERE thread_id = ${threadId}
        `);

        updatedCount++;
        console.log(`Updated thread ${threadId}`);
      }
    }

    console.log(`Image URL fix completed. Updated ${updatedCount} threads.`);

    return NextResponse.json({
      success: true,
      message: `Fixed image URLs for ${updatedCount} threads (changed to /view endpoint)`,
      totalChecked: result.rows.length,
      totalUpdated: updatedCount
    });

  } catch (error) {
    console.error('Error fixing image URLs:', error);
    return NextResponse.json(
      { error: 'Failed to fix image URLs', details: error.message },
      { status: 500 }
    );
  }
} 
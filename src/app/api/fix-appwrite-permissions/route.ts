import { NextRequest, NextResponse } from 'next/server';
import { Client, Storage } from 'node-appwrite';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const storage = new Storage(client);

export async function POST(request: NextRequest) {
  try {
    console.log('Starting Appwrite permissions fix...');

    // Get all threads with images to extract file IDs
    const result = await db.execute(sql`
      SELECT thread_id, images
      FROM threads 
      WHERE images IS NOT NULL 
      AND jsonb_array_length(images) > 0
    `);

    console.log(`Found ${result.rows.length} threads with images`);

    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;
    let updatedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Extract all unique file IDs from the database
    const fileIds = new Set<string>();

    for (const row of result.rows) {
      let images;
      try {
        images = typeof row.images === 'string' ? JSON.parse(row.images) : row.images;
      } catch (e) {
        console.error(`Failed to parse images for thread ${row.thread_id}:`, e);
        continue;
      }

      if (!Array.isArray(images)) continue;

      for (const url of images) {
        if (typeof url !== 'string') continue;

        // Extract file ID from URL
        const fileIdMatch = url.match(/\/files\/([a-zA-Z0-9]+)\/(preview|view)/);
        if (fileIdMatch) {
          fileIds.add(fileIdMatch[1]);
        }
      }
    }

    console.log(`Found ${fileIds.size} unique file IDs to update`);

    // Update permissions for each file
    for (const fileId of fileIds) {
      try {
        console.log(`Updating permissions for file: ${fileId}`);

        // Update file permissions to allow public read access
        await storage.updateFile(
          bucketId,
          fileId,
          undefined, // name - keep existing
          ['read("any")'] // permissions - public read access
        );

        updatedCount++;
        console.log(`✓ Updated permissions for file: ${fileId}`);

      } catch (error: any) {
        errorCount++;
        const errorMsg = `Failed to update file ${fileId}: ${error.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);

        // Continue with other files even if one fails
        continue;
      }
    }

    console.log(`Permissions fix completed. Updated: ${updatedCount}, Errors: ${errorCount}`);

    return NextResponse.json({
      success: true,
      message: `Updated permissions for ${updatedCount} files`,
      totalFiles: fileIds.size,
      updatedCount,
      errorCount,
      errors: errors.slice(0, 10) // Limit error list to first 10
    });

  } catch (error) {
    console.error('Error fixing Appwrite permissions:', error);
    return NextResponse.json(
      { error: 'Failed to fix permissions', details: error.message },
      { status: 500 }
    );
  }
} 
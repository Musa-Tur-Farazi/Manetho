import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    console.log('Debugging images in database...');

    const result = await db.execute(sql`
      SELECT thread_id, title, images, created_at
      FROM threads 
      WHERE images IS NOT NULL 
      ORDER BY created_at DESC
      LIMIT 10
    `);

    const threadsWithImages = result.rows.map((row: any) => {
      let images;
      try {
        images = typeof row.images === 'string' ? JSON.parse(row.images) : row.images;
      } catch (e) {
        images = row.images;
      }

      return {
        threadId: row.thread_id,
        title: row.title,
        images: images,
        createdAt: row.created_at,
        imagesType: typeof row.images,
        imagesRaw: row.images
      };
    });

    return NextResponse.json({
      totalFound: threadsWithImages.length,
      threads: threadsWithImages
    });

  } catch (error) {
    console.error('Error debugging images:', error);
    return NextResponse.json(
      { error: 'Failed to debug images', details: error.message },
      { status: 500 }
    );
  }
} 
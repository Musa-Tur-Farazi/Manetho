import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

// POST - Share a post to user's timeline
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { threadId } = body;

    if (!threadId) {
      return NextResponse.json(
        { error: 'Thread ID is required' },
        { status: 400 }
      );
    }

    // Get the user from the database
    const userResult = await db.execute(
      sql`SELECT user_id FROM users WHERE clerk_id = ${userId} LIMIT 1`
    );

    if (!userResult.rows || userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    // Check if the post exists
    const postResult = await db.execute(
      sql`SELECT thread_id FROM threads WHERE thread_id = ${threadId} LIMIT 1`
    );

    if (!postResult.rows || postResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Create shared_posts table if it doesn't exist
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS shared_posts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          thread_id INTEGER NOT NULL,
          shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, thread_id),
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          FOREIGN KEY (thread_id) REFERENCES threads(thread_id) ON DELETE CASCADE
        )
      `);
    } catch (error) {
      console.log('Shared posts table might already exist:', error);
    }

    // Check if already shared
    const existingShare = await db.execute(
      sql`SELECT id FROM shared_posts WHERE user_id = ${user.user_id} AND thread_id = ${threadId} LIMIT 1`
    );

    if (existingShare.rows && existingShare.rows.length > 0) {
      return NextResponse.json(
        { error: 'Post already shared' },
        { status: 400 }
      );
    }

    // Share the post
    await db.execute(
      sql`INSERT INTO shared_posts (user_id, thread_id) VALUES (${user.user_id}, ${threadId})`
    );

    return NextResponse.json(
      { message: 'Post shared successfully' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error sharing post:', error);
    return NextResponse.json(
      { error: 'Failed to share post' },
      { status: 500 }
    );
  }
} 
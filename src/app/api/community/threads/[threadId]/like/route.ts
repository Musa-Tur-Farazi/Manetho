import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

// POST - Toggle like on a thread
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { threadId } = await params;

    // Get the user from the database
    const userResult = await db.execute(sql`
      SELECT id FROM users WHERE "clerkId" = ${userId} LIMIT 1
    `);

    if (!userResult.rows || userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the current thread
    const threadResult = await db.execute(sql`
      SELECT thread_id, like_count FROM threads WHERE thread_id = ${threadId} LIMIT 1
    `);

    if (!threadResult.rows || threadResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    const thread = threadResult.rows[0];
    const body = await request.json();
    const { isLiked } = body; // true if user is liking, false if unliking

    const newLikeCount = isLiked
      ? (thread.like_count || 0) + 1
      : Math.max(0, (thread.like_count || 0) - 1);

    // Update the thread's like count
    await db.execute(sql`
      UPDATE threads 
      SET like_count = ${newLikeCount}
      WHERE thread_id = ${threadId}
    `);

    return NextResponse.json({
      success: true,
      likeCount: newLikeCount,
      isLiked,
    });

  } catch (error) {
    console.error('Error toggling thread like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
} 
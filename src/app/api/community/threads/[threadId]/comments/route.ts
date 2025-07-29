import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

// GET - Fetch comments for a specific thread
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;

    // Fetch comments with user information using raw SQL
    const result = await db.execute(sql`
      SELECT 
        c.comment_id,
        c.content,
        c.timestamp,
        c.like_count,
        c.parent_comment_id,
        c.sender_id,
        u.full_name,
        u.avatar_url
      FROM comments c
      LEFT JOIN users u ON c.sender_id = u.user_id
      WHERE c.thread_id = ${threadId}
      ORDER BY c.timestamp DESC
    `);

    const comments = result.rows || [];

    // Format the response to match frontend expectations
    const formattedComments = comments.map((comment: Record<string, unknown>) => {
      const authorName = comment.full_name as string || 'Anonymous';

      return {
        id: comment.comment_id,
        author: authorName,
        authorImage: comment.avatar_url as string || 'https://i.pravatar.cc/150?img=12',
        content: comment.content,
        timeAgo: getTimeAgo(comment.timestamp as string),
        likes: comment.like_count as number || 0,
        parentCommentId: comment.parent_comment_id,
      };
    });

    return NextResponse.json(formattedComments);

  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST - Create a new comment
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
    const body = await request.json();
    const { content, parentCommentId } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    console.log('Creating comment for user:', userId, 'thread:', threadId);

    // First, check if user exists in database
    let userResult = await db.execute(sql`
      SELECT "user_id", "full_name", "avatar_url"
      FROM users 
      WHERE "clerk_id" = ${userId}
      LIMIT 1
    `);

    // If user doesn't exist, create them
    if (!userResult.rows || userResult.rows.length === 0) {
      console.log('User not found, creating user:', userId);

      try {
        // Use our sync utility instead of manual user creation
        const { syncUserToDatabase } = await import('@/lib/user-sync');
        const syncResult = await syncUserToDatabase();

        if (!syncResult.success) {
          return NextResponse.json(
            { error: 'Failed to sync user to database' },
            { status: 500 }
          );
        }

        // Re-fetch the user after sync
        userResult = await db.execute(sql`
          SELECT "user_id", "full_name", "avatar_url"
          FROM users 
          WHERE "clerk_id" = ${userId}
          LIMIT 1
        `);
      } catch (createError) {
        console.error('Error creating user for comment:', createError);
        return NextResponse.json(
          { error: 'Failed to create user. Please try again.' },
          { status: 500 }
        );
      }
    }

    const user = userResult.rows[0];

    // Create comment
    const commentResult = await db.execute(sql`
      INSERT INTO comments (thread_id, content, sender_id, parent_comment_id)
      VALUES (${threadId}, ${content}, ${user.user_id}, ${parentCommentId || null})
      RETURNING comment_id, content, timestamp, parent_comment_id, sender_id
    `);

    if (!commentResult.rows || commentResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create comment.' },
        { status: 500 }
      );
    }

    const commentData = commentResult.rows[0];

    // Update thread comment count in a separate simple query
    try {
      await db.execute(sql`
        UPDATE threads 
        SET comment_count = comment_count + 1
        WHERE thread_id = ${threadId}
      `);
    } catch (error) {
      console.error('Failed to update comment count:', error);
      // Don't fail the whole request if just the count update fails
    }

    // Format the response
    const authorName = user.full_name || 'Anonymous';

    const formattedComment = {
      id: commentData.comment_id,
      author: authorName,
      authorImage: user.avatar_url || 'https://i.pravatar.cc/150?img=12',
      content: commentData.content,
      timeAgo: 'Just now',
      likes: 0,
      parentCommentId: commentData.parent_comment_id,
    };

    console.log('Comment created successfully:', formattedComment.id);

    return NextResponse.json(formattedComment, { status: 201 });

  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

// Helper function to calculate time ago
function getTimeAgo(date: Date | string): string {
  const now = new Date();

  // Handle string input from database
  let targetDate: Date;
  if (typeof date === 'string') {
    // If the date string doesn't end with 'Z', treat it as local time
    if (!date.endsWith('Z') && !date.includes('+')) {
      targetDate = new Date(date + 'Z'); // Treat as UTC
    } else {
      targetDate = new Date(date);
    }
  } else {
    targetDate = date;
  }

  // Ensure we have valid dates
  if (!(targetDate instanceof Date) || isNaN(targetDate.getTime())) {
    return 'Just now';
  }

  // Simple direct comparison without timezone conversion
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);

  // Handle future dates (in case of timezone issues)
  if (diffInSeconds < 0) {
    return 'Just now';
  }

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) { // 7 days
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else if (diffInSeconds < 2592000) { // 30 days
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks}w ago`;
  } else if (diffInSeconds < 31536000) { // 365 days
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months}mo ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years}y ago`;
  }
} 
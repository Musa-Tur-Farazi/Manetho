import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { auth, currentUser } from '@clerk/nextjs/server';

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
        u.name,
        u."firstName",
        u."lastName", 
        u."imageUrl"
      FROM comments c
      LEFT JOIN users u ON c.sender_id = u.id
      WHERE c.thread_id = ${threadId}
      ORDER BY c.timestamp DESC
    `);

    const comments = result.rows || [];

    // Format the response to match frontend expectations
    const formattedComments = comments.map((comment: any) => {
      const authorName = comment.name || `${comment.firstName || ''} ${comment.lastName || ''}`.trim() || 'Anonymous';

      return {
        id: comment.comment_id,
        author: authorName,
        authorImage: comment.imageUrl || 'https://i.pravatar.cc/150?img=12',
        content: comment.content,
        timeAgo: getTimeAgo(new Date(comment.timestamp)),
        likes: comment.like_count || 0,
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
      SELECT id, name, "firstName", "lastName", "imageUrl"
      FROM users 
      WHERE "clerkId" = ${userId}
      LIMIT 1
    `);

    // If user doesn't exist, create them
    if (!userResult.rows || userResult.rows.length === 0) {
      console.log('User not found, creating user:', userId);

      try {
        const clerkUser = await currentUser();

        if (!clerkUser) {
          return NextResponse.json(
            { error: 'User not authenticated properly' },
            { status: 401 }
          );
        }

        // Create user in database
        const createUserResult = await db.execute(sql`
          INSERT INTO users ("clerkId", name, email, "firstName", "lastName", "imageUrl", username, role, "isActive", "createdAt", "updatedAt")
          VALUES (
            ${userId},
            ${clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Anonymous'},
            ${clerkUser.emailAddresses[0]?.emailAddress || ''},
            ${clerkUser.firstName || ''},
            ${clerkUser.lastName || ''},
            ${clerkUser.imageUrl || ''},
            ${clerkUser.username || ''},
            'user',
            true,
            NOW(),
            NOW()
          )
          RETURNING id, name, "firstName", "lastName", "imageUrl"
        `);

        if (createUserResult.rows && createUserResult.rows.length > 0) {
          userResult = createUserResult;
          console.log('User created successfully for comment:', createUserResult.rows[0]);
        } else {
          return NextResponse.json(
            { error: 'Failed to create user in database' },
            { status: 500 }
          );
        }
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
      VALUES (${threadId}, ${content}, ${user.id}, ${parentCommentId || null})
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
    const authorName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous';

    const formattedComment = {
      id: commentData.comment_id,
      author: authorName,
      authorImage: user.imageUrl || 'https://i.pravatar.cc/150?img=12',
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
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
} 
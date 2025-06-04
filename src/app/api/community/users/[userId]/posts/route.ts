import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql, eq } from 'drizzle-orm';
import { usersTable } from '@/db/schema';

// GET - Fetch user's posts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Check if userId is in UUID format or Clerk ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isUUID = uuidRegex.test(userId);

    let targetUserId = userId;

    // If not a UUID, assume it's a Clerk ID and convert to internal user ID
    if (!isUUID) {
      const userByClerkId = await db
        .select({ userId: usersTable.userId })
        .from(usersTable)
        .where(eq(usersTable.clerkId, userId))
        .limit(1);

      if (!userByClerkId.length) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      targetUserId = userByClerkId[0].userId;
    }

    // Fetch user's posts
    const result = await db.execute(sql`
      SELECT 
        t.thread_id,
        t.title,
        t.body,
        t.created_at,
        t.like_count,
        t.comment_count,
        t.post_type,
        t.images,
        t.poll_options,
        t.poll_votes,
        u.full_name,
        u.avatar_url
      FROM threads t
      LEFT JOIN users u ON t.created_by = u.user_id
      WHERE t.created_by = ${targetUserId}
      ORDER BY t.created_at DESC
    `);

    const posts = result.rows.map((post: any) => ({
      id: post.thread_id,
      title: post.title,
      content: post.body,
      author: post.full_name || 'Anonymous',
      authorId: targetUserId,
      authorImage: post.avatar_url || 'https://i.pravatar.cc/150?img=12',
      date: new Date(post.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      timeAgo: getTimeAgo(post.created_at),
      stars: post.like_count || 0,
      comments: post.comment_count || 0,
      userStarred: false,
      isPinned: false,
      isShared: false,
      postType: post.post_type || 'post',
      images: post.images ? (typeof post.images === 'string' ? JSON.parse(post.images) : post.images) : [],
      pollOptions: post.poll_options ? (typeof post.poll_options === 'string' ? JSON.parse(post.poll_options) : post.poll_options) : null,
      pollVotes: post.poll_votes ? (typeof post.poll_votes === 'string' ? JSON.parse(post.poll_votes) : post.poll_votes) : null,
    }));

    return NextResponse.json({ posts });

  } catch (error) {
    console.error('Error fetching user posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user posts' },
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
    if (!date.endsWith('Z') && !date.includes('+')) {
      targetDate = new Date(date + 'Z'); // Treat as UTC
    } else {
      targetDate = new Date(date);
    }
  } else {
    targetDate = date;
  }

  if (!(targetDate instanceof Date) || isNaN(targetDate.getTime())) {
    return 'Just now';
  }

  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);

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
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks}w ago`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months}mo ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years}y ago`;
  }
} 
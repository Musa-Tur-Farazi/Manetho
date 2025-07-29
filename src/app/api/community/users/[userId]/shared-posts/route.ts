import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { eq, desc } from 'drizzle-orm';
import { usersTable, savedPostsTable, threadsTable } from '@/db/schema';

// GET - Fetch user's shared posts (saved posts)
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

    // Fetch user's saved posts using proper Drizzle ORM
    const savedPosts = await db
      .select({
        savedAt: savedPostsTable.savedAt,
        threadId: threadsTable.threadId,
        title: threadsTable.title,
        body: threadsTable.body,
        createdAt: threadsTable.createdAt,
        likeCount: threadsTable.likeCount,
        commentCount: threadsTable.commentCount,
        postType: threadsTable.postType,
        images: threadsTable.images,
        pollOptions: threadsTable.pollOptions,
        pollVotes: threadsTable.pollVotes,
        originalAuthorName: usersTable.fullName,
        originalAuthorAvatar: usersTable.avatarUrl,
        originalAuthorId: usersTable.userId,
      })
      .from(savedPostsTable)
      .leftJoin(threadsTable, eq(savedPostsTable.threadId, threadsTable.threadId))
      .leftJoin(usersTable, eq(threadsTable.createdBy, usersTable.userId))
      .where(eq(savedPostsTable.userId, targetUserId))
      .orderBy(desc(savedPostsTable.savedAt))
      .limit(50);

    // Format the response to match expected structure
    const formattedPosts = savedPosts.map(post => ({
      id: post.threadId,
      title: post.title,
      content: post.body,
      createdAt: post.createdAt,
      savedAt: post.savedAt,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      postType: post.postType,
      images: post.images && typeof post.images === 'string' ? JSON.parse(post.images) : [],
      pollOptions: post.pollOptions && typeof post.pollOptions === 'string' ? JSON.parse(post.pollOptions) : null,
      pollVotes: post.pollVotes && typeof post.pollVotes === 'string' ? JSON.parse(post.pollVotes) : null,
      originalAuthor: {
        id: post.originalAuthorId,
        name: post.originalAuthorName,
        avatar: post.originalAuthorAvatar,
      },
      isShared: true, // Mark as shared since these are saved posts
    }));

    return NextResponse.json({
      success: true,
      posts: formattedPosts,
      total: formattedPosts.length,
    });
  } catch (error) {
    console.error('Error fetching user shared posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared posts' },
      { status: 500 }
    );
  }
} 
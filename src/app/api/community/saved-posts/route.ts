import { NextResponse } from 'next/server';
import { db } from '@/db';
import {
  usersTable,
  savedPostsTable,
  threadsTable
} from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user
    const dbUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkId, userId))
      .limit(1);

    if (!dbUser.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentUserId = dbUser[0].userId;

    // Fetch saved posts with thread details
    const savedPosts = await db
      .select({
        savedAt: savedPostsTable.savedAt,
        thread: {
          threadId: threadsTable.threadId,
          title: threadsTable.title,
          body: threadsTable.body,
          createdBy: threadsTable.createdBy,
          createdAt: threadsTable.createdAt,
          likeCount: threadsTable.likeCount,
          commentCount: threadsTable.commentCount,
          viewCount: threadsTable.viewCount,
          isPinned: threadsTable.isPinned,
          isLocked: threadsTable.isLocked,
          postType: threadsTable.postType,
          images: threadsTable.images,
          pollOptions: threadsTable.pollOptions,
          pollVotes: threadsTable.pollVotes,
        },
        author: {
          userId: usersTable.userId,
          fullName: usersTable.fullName,
          avatarUrl: usersTable.avatarUrl,
        }
      })
      .from(savedPostsTable)
      .innerJoin(threadsTable, eq(savedPostsTable.threadId, threadsTable.threadId))
      .innerJoin(usersTable, eq(threadsTable.createdBy, usersTable.userId))
      .where(eq(savedPostsTable.userId, currentUserId))
      .orderBy(desc(savedPostsTable.savedAt));

    return NextResponse.json({
      success: true,
      savedPosts: savedPosts.map(post => ({
        threadId: post.thread.threadId,
        title: post.thread.title,
        content: post.thread.body,
        category: 'general',
        author: post.author.fullName,
        authorId: post.author.userId,
        authorImage: post.author.avatarUrl || '/default-avatar.png',
        createdAt: post.thread.createdAt,
        savedAt: post.savedAt,
        likeCount: post.thread.likeCount,
        commentCount: post.thread.commentCount,
        viewCount: post.thread.viewCount,
        isPinned: post.thread.isPinned,
        isLocked: post.thread.isLocked,
        postType: post.thread.postType,
        images: post.thread.images,
        pollOptions: post.thread.pollOptions,
        pollVotes: post.thread.pollVotes,
      }))
    });

  } catch (error) {
    console.error('Error fetching saved posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { threadId, action } = await request.json();

    if (!threadId || !action) {
      return NextResponse.json({ error: 'Thread ID and action are required' }, { status: 400 });
    }

    // Get current user
    const dbUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkId, userId))
      .limit(1);

    if (!dbUser.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentUserId = dbUser[0].userId;

    if (action === 'save') {
      // Check if already saved
      const existingSave = await db
        .select()
        .from(savedPostsTable)
        .where(
          and(
            eq(savedPostsTable.userId, currentUserId),
            eq(savedPostsTable.threadId, threadId)
          )
        )
        .limit(1);

      if (existingSave.length > 0) {
        return NextResponse.json({ error: 'Post already saved' }, { status: 400 });
      }

      // Save the post
      await db.insert(savedPostsTable).values({
        userId: currentUserId,
        threadId: threadId,
      });

      return NextResponse.json({ success: true, message: 'Post saved successfully' });

    } else if (action === 'unsave') {
      // Remove from saved posts
      await db
        .delete(savedPostsTable)
        .where(
          and(
            eq(savedPostsTable.userId, currentUserId),
            eq(savedPostsTable.threadId, threadId)
          )
        );

      return NextResponse.json({ success: true, message: 'Post unsaved successfully' });

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error managing saved post:', error);
    return NextResponse.json(
      { error: 'Failed to manage saved post' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import {
  usersTable,
  userFollowsTable,
  directMessagesTable,
  userProfilesTable
} from '@/db/schema';
import { eq, sql, desc, and, or } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'online', 'followers', 'following'

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

    if (type === 'current-user') {
      // Return current user's internal database ID
      return NextResponse.json({
        user: {
          userId: currentUserId,
          fullName: dbUser[0].fullName,
          avatarUrl: dbUser[0].avatarUrl,
          clerkId: dbUser[0].clerkId,
        }
      });
    }

    if (type === 'online') {
      // Get recently active users (within last 30 minutes)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

      const onlineUsers = await db
        .select({
          userId: usersTable.userId,
          fullName: usersTable.fullName,
          avatarUrl: usersTable.avatarUrl,
          lastActiveAt: usersTable.lastActiveAt,
          bio: userProfilesTable.bio,
          grade: userProfilesTable.grade,
        })
        .from(usersTable)
        .leftJoin(userProfilesTable, eq(usersTable.userId, userProfilesTable.userId))
        .where(
          and(
            sql`${usersTable.lastActiveAt} > ${thirtyMinutesAgo}`,
            sql`${usersTable.userId} != ${currentUserId}`
          )
        )
        .orderBy(desc(usersTable.lastActiveAt))
        .limit(20);

      return NextResponse.json({
        users: onlineUsers.map(user => ({
          userId: user.userId,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          lastActiveAt: user.lastActiveAt,
          status: 'online',
          currentActivity: user.grade ? `Studying ${user.grade}` : 'Online',
        }))
      });
    }

    if (type === 'followers') {
      // Get users who follow the current user
      const followers = await db
        .select({
          userId: usersTable.userId,
          fullName: usersTable.fullName,
          avatarUrl: usersTable.avatarUrl,
          lastActiveAt: usersTable.lastActiveAt,
          followedAt: userFollowsTable.createdAt,
        })
        .from(userFollowsTable)
        .innerJoin(usersTable, eq(userFollowsTable.followerId, usersTable.userId))
        .where(eq(userFollowsTable.followingId, currentUserId))
        .orderBy(desc(userFollowsTable.createdAt))
        .limit(50);

      return NextResponse.json({ users: followers });
    }

    if (type === 'following') {
      // Get users that the current user follows
      const following = await db
        .select({
          userId: usersTable.userId,
          fullName: usersTable.fullName,
          avatarUrl: usersTable.avatarUrl,
          lastActiveAt: usersTable.lastActiveAt,
          followedAt: userFollowsTable.createdAt,
        })
        .from(userFollowsTable)
        .innerJoin(usersTable, eq(userFollowsTable.followingId, usersTable.userId))
        .where(eq(userFollowsTable.followerId, currentUserId))
        .orderBy(desc(userFollowsTable.createdAt))
        .limit(50);

      return NextResponse.json({ users: following });
    }

    if (type === 'recent-chats') {
      // Get users with recent direct messages (only from followed users)
      const recentChats = await db
        .select({
          userId: usersTable.userId,
          fullName: usersTable.fullName,
          avatarUrl: usersTable.avatarUrl,
          lastMessageTime: directMessagesTable.timestamp,
          lastMessage: directMessagesTable.content,
          isRead: directMessagesTable.isRead,
        })
        .from(directMessagesTable)
        .innerJoin(
          usersTable,
          or(
            eq(directMessagesTable.senderId, usersTable.userId),
            eq(directMessagesTable.recipientId, usersTable.userId)
          )
        )
        .innerJoin(
          userFollowsTable,
          or(
            and(
              eq(userFollowsTable.followerId, currentUserId),
              eq(userFollowsTable.followingId, usersTable.userId)
            ),
            and(
              eq(userFollowsTable.followingId, currentUserId),
              eq(userFollowsTable.followerId, usersTable.userId)
            )
          )
        )
        .where(
          or(
            eq(directMessagesTable.senderId, currentUserId),
            eq(directMessagesTable.recipientId, currentUserId)
          )
        )
        .orderBy(desc(directMessagesTable.timestamp))
        .limit(20);

      // Remove duplicates and current user
      const uniqueChats = recentChats
        .filter((chat, index, self) =>
          chat.userId !== currentUserId &&
          index === self.findIndex(c => c.userId === chat.userId)
        )
        .slice(0, 10);

      return NextResponse.json({ users: uniqueChats });
    }

    if (type === 'unknown-message-senders') {
      // Get users who have sent messages to current user but are not followed
      const unknownSenders = await db
        .select({
          userId: usersTable.userId,
          fullName: usersTable.fullName,
          avatarUrl: usersTable.avatarUrl,
          lastActiveAt: usersTable.lastActiveAt,
          lastMessageTime: directMessagesTable.timestamp,
        })
        .from(directMessagesTable)
        .innerJoin(usersTable, eq(directMessagesTable.senderId, usersTable.userId))
        .leftJoin(
          userFollowsTable,
          and(
            eq(userFollowsTable.followerId, currentUserId),
            eq(userFollowsTable.followingId, usersTable.userId)
          )
        )
        .where(
          and(
            eq(directMessagesTable.recipientId, currentUserId),
            sql`${userFollowsTable.followerId} IS NULL`, // Not followed
            sql`${usersTable.userId} != ${currentUserId}` // Not current user
          )
        )
        .orderBy(desc(directMessagesTable.timestamp));

      // Remove duplicates
      const uniqueUnknownSenders = unknownSenders
        .filter((sender, index, self) =>
          index === self.findIndex(s => s.userId === sender.userId)
        )
        .slice(0, 10);

      return NextResponse.json({ users: uniqueUnknownSenders });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
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

    const { targetUserId, action } = await request.json();

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

    if (action === 'follow') {
      // Check if already following
      const existingFollow = await db
        .select()
        .from(userFollowsTable)
        .where(
          and(
            eq(userFollowsTable.followerId, currentUserId),
            eq(userFollowsTable.followingId, targetUserId)
          )
        )
        .limit(1);

      if (existingFollow.length > 0) {
        return NextResponse.json({ error: 'Already following this user' }, { status: 400 });
      }

      // Create follow relationship
      await db.insert(userFollowsTable).values({
        followerId: currentUserId,
        followingId: targetUserId,
      });

      return NextResponse.json({ success: true, message: 'User followed successfully' });
    }

    if (action === 'unfollow') {
      // Remove follow relationship
      await db
        .delete(userFollowsTable)
        .where(
          and(
            eq(userFollowsTable.followerId, currentUserId),
            eq(userFollowsTable.followingId, targetUserId)
          )
        );

      return NextResponse.json({ success: true, message: 'User unfollowed successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error managing follow relationship:', error);
    return NextResponse.json(
      { error: 'Failed to update follow relationship' },
      { status: 500 }
    );
  }
} 
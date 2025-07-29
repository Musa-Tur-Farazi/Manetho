import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { directChatMeetingLinksTable, usersTable } from '@/db/schema';
import { eq, and, or, desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

// GET: Fetch meeting links for a direct chat between two users
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get('otherUserId');

    if (!otherUserId) {
      return NextResponse.json({ error: 'Other user ID is required' }, { status: 400 });
    }

    // Get current user's internal ID
    const currentUser = await db
      .select({ userId: usersTable.userId })
      .from(usersTable)
      .where(eq(usersTable.clerkId, userId))
      .limit(1);

    if (!currentUser.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentUserInternalId = currentUser[0].userId;

    // Fetch meeting links between the two users
    const meetingLinks = await db
      .select({
        linkId: directChatMeetingLinksTable.linkId,
        platform: directChatMeetingLinksTable.platform,
        url: directChatMeetingLinksTable.url,
        createdAt: directChatMeetingLinksTable.createdAt,
        isActive: directChatMeetingLinksTable.isActive,
        createdBy: directChatMeetingLinksTable.createdBy,
        creatorName: usersTable.fullName,
        creatorAvatar: usersTable.avatarUrl,
      })
      .from(directChatMeetingLinksTable)
      .innerJoin(usersTable, eq(usersTable.userId, directChatMeetingLinksTable.createdBy))
      .where(
        and(
          or(
            and(
              eq(directChatMeetingLinksTable.user1Id, currentUserInternalId),
              eq(directChatMeetingLinksTable.user2Id, otherUserId)
            ),
            and(
              eq(directChatMeetingLinksTable.user1Id, otherUserId),
              eq(directChatMeetingLinksTable.user2Id, currentUserInternalId)
            )
          ),
          eq(directChatMeetingLinksTable.isActive, true)
        )
      )
      .orderBy(desc(directChatMeetingLinksTable.createdAt));

    return NextResponse.json({ meetingLinks });
  } catch (error) {
    console.error('Error fetching direct chat meeting links:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new meeting link between two users
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { otherUserId, platform, url } = await request.json();

    if (!otherUserId || !platform || !url) {
      return NextResponse.json({ error: 'Other user ID, platform, and URL are required' }, { status: 400 });
    }

    // Get current user's internal ID
    const currentUser = await db
      .select({ userId: usersTable.userId })
      .from(usersTable)
      .where(eq(usersTable.clerkId, userId))
      .limit(1);

    if (!currentUser.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentUserInternalId = currentUser[0].userId;

    // Prevent creating meeting with yourself
    if (currentUserInternalId === otherUserId) {
      return NextResponse.json({ error: 'Cannot create meeting with yourself' }, { status: 400 });
    }

    // First, mark any existing meeting links as inactive (old ones get erased)
    await db
      .update(directChatMeetingLinksTable)
      .set({ isActive: false })
      .where(
        and(
          or(
            and(
              eq(directChatMeetingLinksTable.user1Id, currentUserInternalId),
              eq(directChatMeetingLinksTable.user2Id, otherUserId)
            ),
            and(
              eq(directChatMeetingLinksTable.user1Id, otherUserId),
              eq(directChatMeetingLinksTable.user2Id, currentUserInternalId)
            )
          ),
          eq(directChatMeetingLinksTable.isActive, true)
        )
      );

    // Create new meeting link
    // Ensure consistent ordering of user IDs (smaller UUID first)
    const [user1Id, user2Id] = [currentUserInternalId, otherUserId].sort();

    const [newLink] = await db
      .insert(directChatMeetingLinksTable)
      .values({
        user1Id,
        user2Id,
        platform,
        url,
        createdBy: currentUserInternalId,
      })
      .returning();

    console.log('📞 Created new direct chat meeting link:', {
      linkId: newLink.linkId,
      user1Id,
      user2Id,
      platform,
      url: url.substring(0, 50) + '...',
      createdBy: currentUserInternalId
    });

    return NextResponse.json({ meetingLink: newLink });
  } catch (error) {
    console.error('Error creating direct chat meeting link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a meeting link
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { linkId } = await request.json();

    if (!linkId) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 });
    }

    // Get current user's internal ID
    const currentUser = await db
      .select({ userId: usersTable.userId })
      .from(usersTable)
      .where(eq(usersTable.clerkId, userId))
      .limit(1);

    if (!currentUser.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentUserInternalId = currentUser[0].userId;

    // Verify the user is involved in this meeting link
    const [linkInfo] = await db
      .select({
        createdBy: directChatMeetingLinksTable.createdBy,
        user1Id: directChatMeetingLinksTable.user1Id,
        user2Id: directChatMeetingLinksTable.user2Id,
      })
      .from(directChatMeetingLinksTable)
      .where(
        and(
          eq(directChatMeetingLinksTable.linkId, linkId),
          eq(directChatMeetingLinksTable.isActive, true)
        )
      )
      .limit(1);

    if (!linkInfo) {
      return NextResponse.json({ error: 'Meeting link not found' }, { status: 404 });
    }

    // Check if user can delete (either participant can delete)
    const canDelete = linkInfo.user1Id === currentUserInternalId ||
      linkInfo.user2Id === currentUserInternalId;

    if (!canDelete) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Delete meeting link (soft delete)
    await db
      .update(directChatMeetingLinksTable)
      .set({ isActive: false })
      .where(eq(directChatMeetingLinksTable.linkId, linkId));

    console.log('🗑️ Deleted direct chat meeting link:', linkId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting direct chat meeting link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
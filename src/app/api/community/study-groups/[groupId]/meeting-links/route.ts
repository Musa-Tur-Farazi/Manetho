import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { meetingLinksTable, studyGroupsTable, studyGroupMembersTable, usersTable } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';

// GET: Fetch all meeting links for a group
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;

    // Verify user is a member of the group
    const membership = await db
      .select()
      .from(studyGroupMembersTable)
      .innerJoin(usersTable, eq(usersTable.clerkId, user.id))
      .where(
        and(
          eq(studyGroupMembersTable.groupId, groupId),
          eq(studyGroupMembersTable.userId, usersTable.userId),
          eq(studyGroupMembersTable.isActive, true)
        )
      )
      .limit(1);

    if (!membership.length) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch meeting links
    const meetingLinks = await db
      .select({
        linkId: meetingLinksTable.linkId,
        platform: meetingLinksTable.platform,
        url: meetingLinksTable.url,
        createdAt: meetingLinksTable.createdAt,
        isActive: meetingLinksTable.isActive,
        creatorName: usersTable.fullName,
        creatorAvatar: usersTable.avatarUrl,
      })
      .from(meetingLinksTable)
      .innerJoin(usersTable, eq(usersTable.userId, meetingLinksTable.createdBy))
      .where(
        and(
          eq(meetingLinksTable.groupId, groupId),
          eq(meetingLinksTable.isActive, true)
        )
      )
      .orderBy(desc(meetingLinksTable.createdAt));

    return NextResponse.json({ meetingLinks });
  } catch (error) {
    console.error('Error fetching meeting links:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new meeting link
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;
    const { platform, url } = await request.json();

    if (!platform || !url) {
      return NextResponse.json({ error: 'Platform and URL are required' }, { status: 400 });
    }

    // Get user's internal ID
    const userRecord = await db
      .select({ userId: usersTable.userId })
      .from(usersTable)
      .where(eq(usersTable.clerkId, user.id))
      .limit(1);

    if (!userRecord.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userRecord[0].userId;

    // Verify user is an organizer of the group
    const membership = await db
      .select()
      .from(studyGroupMembersTable)
      .where(
        and(
          eq(studyGroupMembersTable.groupId, groupId),
          eq(studyGroupMembersTable.userId, userId),
          eq(studyGroupMembersTable.role, 'organizer'),
          eq(studyGroupMembersTable.isActive, true)
        )
      )
      .limit(1);

    if (!membership.length) {
      return NextResponse.json({ error: 'Only organizers can create meeting links' }, { status: 403 });
    }

    // Create meeting link
    const [newLink] = await db
      .insert(meetingLinksTable)
      .values({
        groupId,
        platform,
        url,
        createdBy: userId,
      })
      .returning();

    return NextResponse.json({ meetingLink: newLink });
  } catch (error) {
    console.error('Error creating meeting link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a meeting link
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;
    const { linkId } = await request.json();

    if (!linkId) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 });
    }

    // Get user's internal ID
    const userRecord = await db
      .select({ userId: usersTable.userId })
      .from(usersTable)
      .where(eq(usersTable.clerkId, user.id))
      .limit(1);

    if (!userRecord.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userRecord[0].userId;

    // Verify user is an organizer or the creator of the link
    const [linkInfo] = await db
      .select({
        createdBy: meetingLinksTable.createdBy,
        userRole: studyGroupMembersTable.role,
      })
      .from(meetingLinksTable)
      .innerJoin(studyGroupMembersTable,
        and(
          eq(studyGroupMembersTable.groupId, meetingLinksTable.groupId),
          eq(studyGroupMembersTable.userId, userId)
        )
      )
      .where(
        and(
          eq(meetingLinksTable.linkId, linkId),
          eq(meetingLinksTable.groupId, groupId),
          eq(meetingLinksTable.isActive, true)
        )
      )
      .limit(1);

    if (!linkInfo) {
      return NextResponse.json({ error: 'Meeting link not found' }, { status: 404 });
    }

    // Check if user can delete (organizer or creator)
    if (linkInfo.userRole !== 'organizer' && linkInfo.createdBy !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Delete meeting link (soft delete)
    await db
      .update(meetingLinksTable)
      .set({ isActive: false })
      .where(eq(meetingLinksTable.linkId, linkId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting meeting link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
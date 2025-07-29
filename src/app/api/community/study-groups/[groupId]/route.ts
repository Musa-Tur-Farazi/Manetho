import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import {
  studyGroupsTable,
  studyGroupMembersTable,
  usersTable,
  subjectsTable
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;

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

    // Get group with creator info
    const group = await db
      .select({
        groupId: studyGroupsTable.groupId,
        name: studyGroupsTable.name,
        description: studyGroupsTable.description,
        meetingType: studyGroupsTable.meetingType,
        meetingLink: studyGroupsTable.meetingLink,
        nextMeeting: studyGroupsTable.nextMeeting,
        meetingTime: studyGroupsTable.meetingTime,
        currentParticipants: studyGroupsTable.currentParticipants,
        maxParticipants: studyGroupsTable.maxParticipants,
        subjectName: subjectsTable.name,
        subjectColor: subjectsTable.color,
        creatorName: usersTable.fullName,
        creatorAvatar: usersTable.avatarUrl,
        createdAt: studyGroupsTable.createdAt,
        createdBy: studyGroupsTable.createdBy,
        isActive: studyGroupsTable.isActive,
      })
      .from(studyGroupsTable)
      .leftJoin(usersTable, eq(studyGroupsTable.createdBy, usersTable.userId))
      .leftJoin(subjectsTable, eq(studyGroupsTable.subjectId, subjectsTable.subjectId))
      .where(eq(studyGroupsTable.groupId, groupId))
      .limit(1);

    if (!group.length || !group[0].isActive) {
      return NextResponse.json({ error: 'Study group not found' }, { status: 404 });
    }

    // Check if user is a member
    const membership = await db
      .select()
      .from(studyGroupMembersTable)
      .where(
        and(
          eq(studyGroupMembersTable.groupId, groupId),
          eq(studyGroupMembersTable.userId, currentUserId),
          eq(studyGroupMembersTable.isActive, true)
        )
      )
      .limit(1);

    if (!membership.length) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const groupData = {
      ...group[0],
      userRole: membership[0].role,
      isCreator: group[0].createdBy === currentUserId,
      onlineMembersCount: 0, // You can implement this based on your online tracking
    };

    return NextResponse.json({ group: groupData });

  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;
    const { meetingLink } = await request.json();

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

    // Check if user is organizer of the group
    const membership = await db
      .select()
      .from(studyGroupMembersTable)
      .where(
        and(
          eq(studyGroupMembersTable.groupId, groupId),
          eq(studyGroupMembersTable.userId, currentUserId),
          eq(studyGroupMembersTable.role, 'organizer'),
          eq(studyGroupMembersTable.isActive, true)
        )
      )
      .limit(1);

    if (!membership.length) {
      return NextResponse.json({ error: 'Only organizers can update meeting links' }, { status: 403 });
    }

    // Update the group's meeting link
    await db
      .update(studyGroupsTable)
      .set({
        meetingLink,
        updatedAt: new Date(),
      })
      .where(eq(studyGroupsTable.groupId, groupId));

    return NextResponse.json({ success: true, message: 'Meeting link updated successfully' });

  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { error: 'Failed to update group' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import {
  studyGroupsTable,
  studyGroupMembersTable,
  usersTable,
  subjectsTable,
  studyGroupJoinRequestsTable
} from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'my-groups', 'active-groups'

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

    if (type === 'my-groups') {
      // Get study groups where user is a member
      const myGroups = await db
        .select({
          groupId: studyGroupsTable.groupId,
          name: studyGroupsTable.name,
          description: studyGroupsTable.description,
          meetingType: studyGroupsTable.meetingType,
          nextMeeting: studyGroupsTable.nextMeeting,
          meetingTime: studyGroupsTable.meetingTime,
          currentParticipants: studyGroupsTable.currentParticipants,
          maxParticipants: studyGroupsTable.maxParticipants,
          subjectName: subjectsTable.name,
          subjectColor: subjectsTable.color,
          creatorName: usersTable.fullName,
          creatorAvatar: usersTable.avatarUrl,
          memberRole: studyGroupMembersTable.role,
          joinedAt: studyGroupMembersTable.joinedAt,
        })
        .from(studyGroupMembersTable)
        .innerJoin(studyGroupsTable, eq(studyGroupMembersTable.groupId, studyGroupsTable.groupId))
        .leftJoin(subjectsTable, eq(studyGroupsTable.subjectId, subjectsTable.subjectId))
        .leftJoin(usersTable, eq(studyGroupsTable.createdBy, usersTable.userId))
        .where(
          and(
            eq(studyGroupMembersTable.userId, currentUserId),
            eq(studyGroupMembersTable.isActive, true),
            eq(studyGroupsTable.isActive, true)
          )
        )
        .orderBy(desc(studyGroupMembersTable.joinedAt));

      return NextResponse.json({ groups: myGroups });
    }

    if (type === 'active-groups') {
      // Get active study groups with recent activity
      const activeGroups = await db
        .select({
          groupId: studyGroupsTable.groupId,
          name: studyGroupsTable.name,
          description: studyGroupsTable.description,
          meetingType: studyGroupsTable.meetingType,
          currentParticipants: studyGroupsTable.currentParticipants,
          maxParticipants: studyGroupsTable.maxParticipants,
          subjectName: subjectsTable.name,
          subjectColor: subjectsTable.color,
          tags: studyGroupsTable.tags,
        })
        .from(studyGroupsTable)
        .leftJoin(subjectsTable, eq(studyGroupsTable.subjectId, subjectsTable.subjectId))
        .where(eq(studyGroupsTable.isActive, true))
        .orderBy(desc(studyGroupsTable.currentParticipants))
        .limit(10);

      return NextResponse.json({ groups: activeGroups });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });

  } catch (error) {
    console.error('Error fetching study groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch study groups' },
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

    const { groupId, action } = await request.json();

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

    if (action === 'join') {
      // Check if group exists and has space
      const group = await db
        .select()
        .from(studyGroupsTable)
        .where(eq(studyGroupsTable.groupId, groupId))
        .limit(1);

      if (!group.length) {
        return NextResponse.json({ error: 'Study group not found' }, { status: 404 });
      }

      if (group[0].currentParticipants >= group[0].maxParticipants) {
        return NextResponse.json({ error: 'Study group is full' }, { status: 400 });
      }

      // Check if already a member
      const existingMembership = await db
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

      if (existingMembership.length > 0) {
        return NextResponse.json({ error: 'Already a member of this group' }, { status: 400 });
      }

      // Add user to group
      await db.insert(studyGroupMembersTable).values({
        groupId,
        userId: currentUserId,
        role: 'member',
      });

      // Update participant count
      await db
        .update(studyGroupsTable)
        .set({
          currentParticipants: sql`${studyGroupsTable.currentParticipants} + 1`,
          updatedAt: new Date()
        })
        .where(eq(studyGroupsTable.groupId, groupId));

      return NextResponse.json({ success: true, message: 'Successfully joined study group' });
    }

    if (action === 'leave') {
      // Remove user from group
      await db
        .update(studyGroupMembersTable)
        .set({ isActive: false })
        .where(
          and(
            eq(studyGroupMembersTable.groupId, groupId),
            eq(studyGroupMembersTable.userId, currentUserId)
          )
        );

      // Update participant count
      await db
        .update(studyGroupsTable)
        .set({
          currentParticipants: sql`${studyGroupsTable.currentParticipants} - 1`,
          updatedAt: new Date()
        })
        .where(eq(studyGroupsTable.groupId, groupId));

      return NextResponse.json({ success: true, message: 'Successfully left study group' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error managing study group membership:', error);
    return NextResponse.json(
      { error: 'Failed to update study group membership' },
      { status: 500 }
    );
  }
} 
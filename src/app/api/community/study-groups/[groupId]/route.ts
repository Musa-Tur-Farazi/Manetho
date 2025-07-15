import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import {
  studyGroupsTable,
  studyGroupMembersTable,
  usersTable,
  subjectsTable
} from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
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

    // Verify user is a member of the study group
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
      return NextResponse.json({ error: 'You are not a member of this study group' }, { status: 403 });
    }

    // Get group information with creator and subject details
    const groupInfo = await db
      .select({
        groupId: studyGroupsTable.groupId,
        name: studyGroupsTable.name,
        description: studyGroupsTable.description,
        meetingType: studyGroupsTable.meetingType,
        location: studyGroupsTable.location,
        meetingLink: studyGroupsTable.meetingLink,
        nextMeeting: studyGroupsTable.nextMeeting,
        meetingTime: studyGroupsTable.meetingTime,
        maxParticipants: studyGroupsTable.maxParticipants,
        currentParticipants: studyGroupsTable.currentParticipants,
        tags: studyGroupsTable.tags,
        isActive: studyGroupsTable.isActive,
        createdAt: studyGroupsTable.createdAt,
        createdBy: studyGroupsTable.createdBy,
        creatorName: usersTable.fullName,
        creatorAvatar: usersTable.avatarUrl,
        subjectName: subjectsTable.name,
        subjectColor: subjectsTable.color,
      })
      .from(studyGroupsTable)
      .leftJoin(usersTable, eq(studyGroupsTable.createdBy, usersTable.userId))
      .leftJoin(subjectsTable, eq(studyGroupsTable.subjectId, subjectsTable.subjectId))
      .where(eq(studyGroupsTable.groupId, groupId))
      .limit(1);

    if (!groupInfo.length) {
      return NextResponse.json({ error: 'Study group not found' }, { status: 404 });
    }

    const group = groupInfo[0];

    // Get online members count (active within last 5 minutes)
    const onlineMembersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(studyGroupMembersTable)
      .innerJoin(usersTable, eq(studyGroupMembersTable.userId, usersTable.userId))
      .where(
        and(
          eq(studyGroupMembersTable.groupId, groupId),
          eq(studyGroupMembersTable.isActive, true),
          sql`${usersTable.lastActiveAt} > ${new Date(Date.now() - 5 * 60 * 1000)}`
        )
      );

    const onlineMembersCount = onlineMembersResult[0]?.count || 0;

    // Get current user's role in the group
    const userRole = membership[0]?.role || 'member';

    // Format the response
    const response = {
      ...group,
      onlineMembersCount,
      userRole,
      isCreator: group.createdBy === currentUserId,
      tags: group.tags || [],
    };

    return NextResponse.json({
      group: response,
    });

  } catch (error) {
    console.error('Error fetching group info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group info' },
      { status: 500 }
    );
  }
} 
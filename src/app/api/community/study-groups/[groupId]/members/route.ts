import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import {
  studyGroupMembersTable,
  usersTable
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

    // Get all group members with their information
    const members = await db
      .select({
        userId: usersTable.userId,
        fullName: usersTable.fullName,
        avatarUrl: usersTable.avatarUrl,
        lastActiveAt: usersTable.lastActiveAt,
        role: studyGroupMembersTable.role,
        joinedAt: studyGroupMembersTable.joinedAt,
      })
      .from(studyGroupMembersTable)
      .innerJoin(usersTable, eq(studyGroupMembersTable.userId, usersTable.userId))
      .where(
        and(
          eq(studyGroupMembersTable.groupId, groupId),
          eq(studyGroupMembersTable.isActive, true)
        )
      )
      .orderBy(studyGroupMembersTable.joinedAt);

    // Helper function to check if user is online (active within last 5 minutes)
    const isUserOnline = (lastActiveAt: string | null) => {
      if (!lastActiveAt) return false;
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return new Date(lastActiveAt) > fiveMinutesAgo;
    };

    // Add online status to members
    const membersWithStatus = members.map(member => ({
      ...member,
      isOnline: isUserOnline(member.lastActiveAt ? member.lastActiveAt.toISOString() : null),
      isCurrentUser: member.userId === currentUserId,
    }));

    return NextResponse.json({
      members: membersWithStatus,
      totalMembers: members.length,
    });

  } catch (error) {
    console.error('Error fetching group members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group members' },
      { status: 500 }
    );
  }
} 
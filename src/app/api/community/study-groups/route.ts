import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import {
  studyGroupsTable,
  studyGroupMembersTable,
  usersTable,
  subjectsTable
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

    const body = await request.json();
    const { groupId, action, name, description, subjectName, meetingType, maxParticipants } = body;

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

    // Handle group creation
    if (action === 'create') {
      if (!name || !description || !meetingType) {
        return NextResponse.json({ error: 'Name, description, and meeting type are required' }, { status: 400 });
      }

      // Find or create subject
      let subjectId = null;
      if (subjectName) {
        const existingSubject = await db
          .select()
          .from(subjectsTable)
          .where(eq(subjectsTable.name, subjectName))
          .limit(1);

        if (existingSubject.length > 0) {
          subjectId = existingSubject[0].subjectId;
        } else {
          // Create new subject
          const newSubject = await db
            .insert(subjectsTable)
            .values({
              name: subjectName,
              description: `Subject for ${subjectName}`,
              color: '#64748b', // Default color
            })
            .returning();
          subjectId = newSubject[0].subjectId;
        }
      }

      // Create the study group
      const newGroup = await db
        .insert(studyGroupsTable)
        .values({
          name,
          description,
          subjectId,
          createdBy: currentUserId,
          meetingType,
          maxParticipants: maxParticipants || 10,
          currentParticipants: 1,
        })
        .returning();

      const createdGroup = newGroup[0];

      // Add the creator as the first member with organizer role
      await db.insert(studyGroupMembersTable).values({
        groupId: createdGroup.groupId,
        userId: currentUserId,
        role: 'organizer',
      });

      return NextResponse.json({
        success: true,
        group: createdGroup,
        message: 'Study group created successfully',
      });
    }

    // Handle joining a group
    if (action === 'join') {
      if (!groupId) {
        return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
      }

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

    // Handle leaving a group
    if (action === 'leave') {
      if (!groupId) {
        return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
      }

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
    console.error('Error managing study group:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await request.json();

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
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

    // Check if the group exists and if the user is the creator
    const group = await db
      .select()
      .from(studyGroupsTable)
      .where(eq(studyGroupsTable.groupId, groupId))
      .limit(1);

    if (!group.length) {
      return NextResponse.json({ error: 'Study group not found' }, { status: 404 });
    }

    if (group[0].createdBy !== currentUserId) {
      return NextResponse.json({ error: 'Only the group creator can delete the group' }, { status: 403 });
    }

    // Delete all group members first
    await db
      .update(studyGroupMembersTable)
      .set({ isActive: false })
      .where(eq(studyGroupMembersTable.groupId, groupId));

    // Delete the group
    await db
      .update(studyGroupsTable)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(studyGroupsTable.groupId, groupId));

    return NextResponse.json({ success: true, message: 'Study group deleted successfully' });

  } catch (error) {
    console.error('Error deleting study group:', error);
    return NextResponse.json(
      { error: 'Failed to delete study group' },
      { status: 500 }
    );
  }
} 
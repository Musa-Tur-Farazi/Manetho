import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { notificationsTable, studyGroupMembersTable, studyGroupsTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json({ error: 'Missing notification ID' }, { status: 400 });
    }

    // Get the notification
    const notification = await db
      .select()
      .from(notificationsTable)
      .where(and(
        eq(notificationsTable.notificationId, notificationId),
        eq(notificationsTable.userId, userId),
        eq(notificationsTable.type, 'study_group_invitation')
      ));

    if (notification.length === 0) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    const notificationData = notification[0];
    const invitationData = notificationData.data as any;

    if (!invitationData || !invitationData.groupId) {
      return NextResponse.json({ error: 'Invalid invitation data' }, { status: 400 });
    }

    // Check if group exists
    const group = await db
      .select()
      .from(studyGroupsTable)
      .where(eq(studyGroupsTable.groupId, invitationData.groupId));

    if (group.length === 0) {
      return NextResponse.json({ error: 'Study group not found' }, { status: 404 });
    }

    // Check if user is already a member
    const existingMembership = await db
      .select()
      .from(studyGroupMembersTable)
      .where(and(
        eq(studyGroupMembersTable.groupId, invitationData.groupId),
        eq(studyGroupMembersTable.userId, userId)
      ));

    if (existingMembership.length > 0) {
      return NextResponse.json({ error: 'Already a member of this group' }, { status: 400 });
    }

    // Add user to the study group
    await db
      .insert(studyGroupMembersTable)
      .values({
        groupId: invitationData.groupId,
        userId: userId,
        role: 'member',
        joinedAt: new Date()
      });

    // Mark notification as read
    await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.notificationId, notificationId));

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the study group',
      groupId: invitationData.groupId
    });

  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
} 
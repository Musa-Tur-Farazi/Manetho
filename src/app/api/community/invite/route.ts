import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { randomBytes } from 'crypto';
import { db } from '@/db';
import { notificationsTable, userFollowsTable, usersTable, studyGroupsTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, email, friendId, groupId, message } = body;

    if (action === 'generate') {
      // Generate a unique invite code
      const inviteCode = randomBytes(16).toString('hex');
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const inviteLink = `${baseUrl}/invite/${inviteCode}`;

      // In a real implementation, you'd save this to database with expiration
      // For now, we'll just return the link
      return NextResponse.json({
        success: true,
        inviteLink,
        inviteCode,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        message: 'Invite link generated successfully'
      });
    }

    // Handle friend invitation to study group
    if (friendId && groupId) {
      // Verify the user has permission to invite to this group
      const group = await db
        .select()
        .from(studyGroupsTable)
        .where(eq(studyGroupsTable.groupId, groupId));

      if (group.length === 0) {
        return NextResponse.json({ error: 'Study group not found' }, { status: 404 });
      }

      // Check if the current user is a member of the group
      const userMembership = await db
        .select()
        .from(studyGroupsTable)
        .where(and(
          eq(studyGroupsTable.groupId, groupId),
          eq(studyGroupsTable.creatorId, userId)
        ));

      if (userMembership.length === 0) {
        return NextResponse.json({ error: 'You can only invite friends to groups you created' }, { status: 403 });
      }

      // Verify that the friend is in the user's following list
      const friendship = await db
        .select()
        .from(userFollowsTable)
        .where(and(
          eq(userFollowsTable.followerId, userId),
          eq(userFollowsTable.followingId, friendId)
        ));

      if (friendship.length === 0) {
        return NextResponse.json({ error: 'You can only invite friends from your friends list' }, { status: 403 });
      }

      // Get friend's user info
      const friend = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.userId, friendId));

      if (friend.length === 0) {
        return NextResponse.json({ error: 'Friend not found' }, { status: 404 });
      }

      // Get current user's info
      const currentUser = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.userId, userId));

      // Create notification for the friend
      const notification = await db
        .insert(notificationsTable)
        .values({
          userId: friendId,
          type: 'study_group_invitation',
          title: 'Study Group Invitation',
          message: `${currentUser[0].fullName} invited you to join "${group[0].name}" study group${message ? `: ${message}` : ''}`,
          data: {
            groupId,
            groupName: group[0].name,
            invitedBy: userId,
            invitedByName: currentUser[0].fullName,
            message: message || null
          },
          isRead: false
        })
        .returning();

      return NextResponse.json({
        success: true,
        message: 'Invitation sent successfully',
        data: {
          friendId,
          groupId,
          notificationId: notification[0].notificationId,
          invitedAt: new Date().toISOString()
        }
      });
    }

    return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });

  } catch (error) {
    console.error('Error processing invite:', error);
    return NextResponse.json(
      { error: 'Failed to process invitation' },
      { status: 500 }
    );
  }
} 
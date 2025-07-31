import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { notificationsTable, usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user from the database
    const [user] = await db
      .select({ userId: usersTable.userId })
      .from(usersTable)
      .where(eq(usersTable.clerkId, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create test notifications
    const testNotifications = [
      {
        userId: user.userId,
        type: 'study_group_invitation' as const,
        title: 'Study Group Invitation',
        message: 'You have been invited to join the "Advanced Mathematics" study group',
        data: { groupId: 'test-group-1', groupName: 'Advanced Mathematics' },
        isRead: false
      },
      {
        userId: user.userId,
        type: 'achievement' as const,
        title: 'Achievement Unlocked!',
        message: 'Congratulations! You have earned the "First Steps" achievement',
        data: { achievementId: 'test-achievement-1', achievementName: 'First Steps' },
        isRead: false
      },
      {
        userId: user.userId,
        type: 'social' as const,
        title: 'New Message',
        message: 'Sarah sent you a message in the study group',
        data: { senderId: 'test-sender-1', senderName: 'Sarah' },
        isRead: true
      }
    ];

    // Insert test notifications
    const createdNotifications = await db
      .insert(notificationsTable)
      .values(testNotifications)
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Test notifications created successfully',
      notifications: createdNotifications
    });

  } catch (error) {
    console.error('Error creating test notifications:', error);
    return NextResponse.json(
      { error: 'Failed to create test notifications' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user from the database
    const [user] = await db
      .select({ userId: usersTable.userId })
      .from(usersTable)
      .where(eq(usersTable.clerkId, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all notifications for the user
    const notifications = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, user.userId));

    return NextResponse.json({
      success: true,
      notifications,
      count: notifications.length
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
} 
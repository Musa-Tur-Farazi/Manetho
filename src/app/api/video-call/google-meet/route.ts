import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipientId, callType = 'video' } = await request.json();

    if (!recipientId) {
      return NextResponse.json({
        error: 'Recipient ID is required'
      }, { status: 400 });
    }

    // Get caller info
    const caller = await db
      .select({
        userId: usersTable.userId,
        fullName: usersTable.fullName,
        avatarUrl: usersTable.avatarUrl
      })
      .from(usersTable)
      .where(eq(usersTable.clerkId, userId))
      .limit(1);

    if (caller.length === 0) {
      return NextResponse.json({ error: 'Caller not found' }, { status: 404 });
    }

    // Get recipient info
    const recipient = await db
      .select({
        userId: usersTable.userId,
        fullName: usersTable.fullName,
        avatarUrl: usersTable.avatarUrl
      })
      .from(usersTable)
      .where(eq(usersTable.userId, recipientId))
      .limit(1);

    if (recipient.length === 0) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    const callerInfo = caller[0];
    const recipientInfo = recipient[0];

    // Prevent users from calling themselves
    if (callerInfo.userId === recipientId) {
      return NextResponse.json({
        error: 'Cannot call yourself'
      }, { status: 400 });
    }

    // Generate a unique meeting room name based on user IDs and timestamp
    const timestamp = Date.now();
    const roomName = `${callerInfo.userId.substring(0, 8)}-${recipientId.substring(0, 8)}-${timestamp}`;

    // For Google Meet, we'll generate a meet.google.com link
    // In a production environment, you might want to use Google Meet API
    const meetingUrl = `https://meet.google.com/new`;

    // For now, we'll create a custom meet link that can be shared
    // In production, you would integrate with Google Meet API to create actual meetings
    const customMeetUrl = `https://meet.google.com/${roomName}`;

    console.log('📞 Google Meet call initiated:', {
      caller: callerInfo.fullName,
      recipient: recipientInfo.fullName,
      callType,
      meetingUrl: customMeetUrl
    });

    return NextResponse.json({
      success: true,
      meetingUrl: customMeetUrl,
      fallbackUrl: meetingUrl, // Fallback to new meeting creation
      callDetails: {
        callerId: callerInfo.userId,
        callerName: callerInfo.fullName,
        callerAvatar: callerInfo.avatarUrl,
        recipientId: recipientInfo.userId,
        recipientName: recipientInfo.fullName,
        recipientAvatar: recipientInfo.avatarUrl,
        callType,
        roomName,
        timestamp
      }
    });

  } catch (error) {
    console.error('Google Meet call error:', error);
    return NextResponse.json({
      error: 'Failed to create Google Meet call'
    }, { status: 500 });
  }
} 
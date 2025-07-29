import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import {
  studyGroupMessagesTable,
  studyGroupMembersTable,
  studyGroupsTable,
  usersTable
} from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { pusherServer } from '@/lib/pusher-server';
import { getGroupChatChannel } from '@/lib/chat';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const limit = parseInt(searchParams.get('limit') || '50');

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

    // Get messages for the study group
    const messages = await db
      .select({
        messageId: studyGroupMessagesTable.messageId,
        groupId: studyGroupMessagesTable.groupId,
        senderId: studyGroupMessagesTable.senderId,
        content: studyGroupMessagesTable.content,
        fileUrl: studyGroupMessagesTable.fileUrl,
        fileName: studyGroupMessagesTable.fileName,
        fileType: studyGroupMessagesTable.fileType,
        fileSize: studyGroupMessagesTable.fileSize,
        timestamp: studyGroupMessagesTable.timestamp,
        senderName: usersTable.fullName,
        senderAvatar: usersTable.avatarUrl,
      })
      .from(studyGroupMessagesTable)
      .leftJoin(usersTable, eq(studyGroupMessagesTable.senderId, usersTable.userId))
      .where(eq(studyGroupMessagesTable.groupId, groupId))
      .orderBy(desc(studyGroupMessagesTable.timestamp))
      .limit(limit);

    return NextResponse.json({
      messages: messages.reverse() // Reverse to show oldest first
    });

  } catch (error) {
    console.error('Error fetching group study messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
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

    const { groupId, content, files } = await request.json();

    if (!groupId || (!content?.trim() && (!files || files.length === 0))) {
      return NextResponse.json({ error: 'Group ID and either content or files are required' }, { status: 400 });
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

    // Verify group exists
    const group = await db
      .select()
      .from(studyGroupsTable)
      .where(eq(studyGroupsTable.groupId, groupId))
      .limit(1);

    if (!group.length) {
      return NextResponse.json({ error: 'Study group not found' }, { status: 404 });
    }

    // Create messages based on what's provided
    const createdMessages = [];

    if (files && files.length > 0) {
      // For the first file, include both content and file
      const firstFile = files[0];
      const messageData = {
        groupId,
        senderId: currentUserId,
        content: content?.trim() || null,
        fileUrl: firstFile.url,
        fileName: firstFile.name,
        fileType: firstFile.type,
        fileSize: firstFile.size,
      };

      const newMessage = await db
        .insert(studyGroupMessagesTable)
        .values(messageData)
        .returning();

      createdMessages.push(newMessage[0]);

      // For additional files (if any), create separate messages without content
      for (let i = 1; i < files.length; i++) {
        const file = files[i];
        const additionalMessageData = {
          groupId,
          senderId: currentUserId,
          content: null, // No content for additional files
          fileUrl: file.url,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        };

        const additionalMessage = await db
          .insert(studyGroupMessagesTable)
          .values(additionalMessageData)
          .returning();

        createdMessages.push(additionalMessage[0]);
      }
    } else if (content?.trim()) {
      // Regular text message (only if no files)
      const newMessage = await db
        .insert(studyGroupMessagesTable)
        .values({
          groupId,
          senderId: currentUserId,
          content: content.trim(),
        })
        .returning();

      createdMessages.push(newMessage[0]);
    } else {
      return NextResponse.json({ error: 'Either content or files must be provided' }, { status: 400 });
    }

    // Broadcast each new message via Pusher to all group members
    const channelName = getGroupChatChannel(groupId);

    for (const msg of createdMessages) {
      await pusherServer.trigger(channelName, 'message:new', {
        ...msg,
        senderName: dbUser[0].fullName,
        senderAvatar: dbUser[0].avatarUrl,
      });
    }

    return NextResponse.json({
      success: true,
      message: createdMessages[0], // Return the first message for compatibility
      messages: createdMessages,
      sender: {
        userId: currentUserId,
        fullName: dbUser[0].fullName,
        avatarUrl: dbUser[0].avatarUrl,
      }
    });

  } catch (error) {
    console.error('Error sending group study message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 
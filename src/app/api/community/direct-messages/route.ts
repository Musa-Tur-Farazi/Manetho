import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import {
  directMessagesTable,
  usersTable
} from '@/db/schema';
import { eq, and, or, desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { pusherServer } from '@/lib/pusher-server';
import { getChatChannel } from '@/lib/chat';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const recipientId = searchParams.get('recipientId');
    const limit = parseInt(searchParams.get('limit') || '50');

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

    if (!recipientId) {
      return NextResponse.json({ error: 'Recipient ID is required' }, { status: 400 });
    }

    // Get messages between current user and recipient
    const messages = await db
      .select({
        messageId: directMessagesTable.messageId,
        senderId: directMessagesTable.senderId,
        recipientId: directMessagesTable.recipientId,
        content: directMessagesTable.content,
        fileUrl: directMessagesTable.fileUrl,
        fileName: directMessagesTable.fileName,
        fileType: directMessagesTable.fileType,
        fileSize: directMessagesTable.fileSize,
        isRead: directMessagesTable.isRead,
        timestamp: directMessagesTable.timestamp,
        senderName: usersTable.fullName,
        senderAvatar: usersTable.avatarUrl,
      })
      .from(directMessagesTable)
      .leftJoin(usersTable, eq(directMessagesTable.senderId, usersTable.userId))
      .where(
        or(
          and(
            eq(directMessagesTable.senderId, currentUserId),
            eq(directMessagesTable.recipientId, recipientId)
          ),
          and(
            eq(directMessagesTable.senderId, recipientId),
            eq(directMessagesTable.recipientId, currentUserId)
          )
        )
      )
      .orderBy(desc(directMessagesTable.timestamp))
      .limit(limit);

    // Mark messages as read (messages received by current user)
    await db
      .update(directMessagesTable)
      .set({ isRead: true })
      .where(
        and(
          eq(directMessagesTable.recipientId, currentUserId),
          eq(directMessagesTable.senderId, recipientId),
          eq(directMessagesTable.isRead, false)
        )
      );

    return NextResponse.json({
      messages: messages.reverse() // Reverse to show oldest first
    });

  } catch (error) {
    console.error('Error fetching direct messages:', error);
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

    const { recipientId, content, files } = await request.json();

    if (!recipientId || (!content?.trim() && (!files || files.length === 0))) {
      return NextResponse.json({ error: 'Recipient ID and either content or files are required' }, { status: 400 });
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

    // Verify recipient exists
    const recipient = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.userId, recipientId))
      .limit(1);

    if (!recipient.length) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    // If files are provided, send them as separate messages
    const createdMessages = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const messageData = {
          senderId: currentUserId,
          recipientId,
          content: content?.trim() || null,
          fileUrl: file.url,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          isRead: false,
        };

        const newMessage = await db
          .insert(directMessagesTable)
          .values(messageData)
          .returning();

        createdMessages.push(newMessage[0]);
      }
    } else if (content?.trim()) {
      // Regular text message
      const newMessage = await db
        .insert(directMessagesTable)
        .values({
          senderId: currentUserId,
          recipientId,
          content: content.trim(),
          isRead: false,
        })
        .returning();

      createdMessages.push(newMessage[0]);
    } else {
      return NextResponse.json({ error: 'Either content or files must be provided' }, { status: 400 });
    }

    // Broadcast each new message via Pusher
    const channelName = getChatChannel(currentUserId, recipientId);

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
    console.error('Error sending direct message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 
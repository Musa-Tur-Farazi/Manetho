import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { doubtSolvingSessionsTable, doubtSolvingMessagesTable } from '@/db/schema';
import { sql } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { syncUserToDatabase } from '@/lib/user-sync';

// GET - Fetch messages for a specific session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { userId } = await auth();
    const { sessionId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to view messages' },
        { status: 401 }
      );
    }

    // Ensure user exists in database
    const syncResult = await syncUserToDatabase();
    if (!syncResult.success) {
      console.warn('User sync failed:', syncResult.message);
    }

    // Get user's database ID using correct column names
    const userResult = await db.execute(sql`
      SELECT "user_id" FROM users WHERE "clerk_id" = ${userId} LIMIT 1
    `);

    if (!userResult.rows || userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    const userDbId = userResult.rows[0].user_id;

    // Verify session belongs to user
    const sessionResult = await db.execute(sql`
      SELECT session_id FROM doubt_solving_sessions 
      WHERE session_id = ${sessionId} AND user_id = ${userDbId}
      LIMIT 1
    `);

    if (!sessionResult.rows || sessionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Session not found or access denied' },
        { status: 404 }
      );
    }

    // Fetch messages for the session
    const messagesResult = await db.execute(sql`
      SELECT 
        message_id,
        role,
        content,
        attachment_url,
        attachment_type,
        attachment_name,
        token_count,
        processing_time,
        model_used,
        metadata,
        created_at
      FROM doubt_solving_messages
      WHERE session_id = ${sessionId}
      ORDER BY created_at ASC
    `);

    const messages = messagesResult.rows.map((message: any) => ({
      id: message.message_id,
      role: message.role,
      content: message.content,
      attachmentUrl: message.attachment_url,
      attachmentType: message.attachment_type,
      attachmentName: message.attachment_name,
      tokenCount: message.token_count,
      processingTime: message.processing_time,
      modelUsed: message.model_used,
      metadata: message.metadata,
      timestamp: new Date(message.created_at),
    }));

    return NextResponse.json({ messages });

  } catch (error) {
    console.error('Error fetching doubt-solving messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Add a new message to the session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { userId } = await auth();
    const { sessionId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to send messages' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      role,
      content,
      attachmentUrl,
      attachmentType,
      attachmentName,
      tokenCount,
      processingTime,
      modelUsed,
      metadata
    } = body;

    if (!role || !content) {
      return NextResponse.json(
        { error: 'Role and content are required' },
        { status: 400 }
      );
    }

    // Ensure user exists in database
    const syncResult = await syncUserToDatabase();
    if (!syncResult.success) {
      return NextResponse.json(
        { error: `Failed to sync user: ${syncResult.message}` },
        { status: 500 }
      );
    }

    // Get user's database ID using correct column names
    const userResult = await db.execute(sql`
      SELECT "user_id" FROM users WHERE "clerk_id" = ${userId} LIMIT 1
    `);

    if (!userResult.rows || userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    const userDbId = userResult.rows[0].user_id;

    // Verify session belongs to user
    const sessionResult = await db.execute(sql`
      SELECT session_id FROM doubt_solving_sessions 
      WHERE session_id = ${sessionId} AND user_id = ${userDbId}
      LIMIT 1
    `);

    if (!sessionResult.rows || sessionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Session not found or access denied' },
        { status: 404 }
      );
    }

    // Insert new message
    const messageResult = await db.execute(sql`
      INSERT INTO doubt_solving_messages (
        session_id, 
        role, 
        content, 
        attachment_url, 
        attachment_type, 
        attachment_name,
        token_count,
        processing_time,
        model_used,
        metadata
      )
      VALUES (
        ${sessionId}, 
        ${role}, 
        ${content}, 
        ${attachmentUrl || null}, 
        ${attachmentType || null}, 
        ${attachmentName || null},
        ${tokenCount || null},
        ${processingTime || null},
        ${modelUsed || null},
        ${metadata ? JSON.stringify(metadata) : null}
      )
      RETURNING *
    `);

    const newMessage = messageResult.rows[0];

    // Update session's message count and last message time
    await db.execute(sql`
      UPDATE doubt_solving_sessions 
      SET 
        message_count = message_count + 1,
        last_message_at = NOW(),
        updated_at = NOW()
      WHERE session_id = ${sessionId}
    `);

    return NextResponse.json({
      message: {
        id: newMessage.message_id,
        role: newMessage.role,
        content: newMessage.content,
        attachmentUrl: newMessage.attachment_url,
        attachmentType: newMessage.attachment_type,
        attachmentName: newMessage.attachment_name,
        tokenCount: newMessage.token_count,
        processingTime: newMessage.processing_time,
        modelUsed: newMessage.model_used,
        metadata: newMessage.metadata,
        timestamp: new Date(newMessage.created_at as string),
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating doubt-solving message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
} 
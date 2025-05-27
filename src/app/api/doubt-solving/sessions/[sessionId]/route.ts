import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { syncUserToDatabase } from '@/lib/user-sync';

// GET - Fetch specific session details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { userId } = await auth();
    const { sessionId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to view session' },
        { status: 401 }
      );
    }

    // Ensure user exists in database
    const syncResult = await syncUserToDatabase();
    if (!syncResult.success) {
      console.warn('User sync failed:', syncResult.message);
    }

    // Get user's database ID
    const userResult = await db.execute(sql`
      SELECT id FROM users WHERE "clerkId" = ${userId} LIMIT 1
    `);

    if (!userResult.rows || userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    const userDbId = userResult.rows[0].id;

    // Fetch session details
    const sessionResult = await db.execute(sql`
      SELECT 
        s.session_id,
        s.title,
        s.subject_id,
        s.topic_id,
        s.message_count,
        s.last_message_at,
        s.is_archived,
        s.created_at,
        s.updated_at,
        COUNT(m.message_id) as actual_message_count
      FROM doubt_solving_sessions s
      LEFT JOIN doubt_solving_messages m ON s.session_id = m.session_id
      WHERE s.session_id = ${sessionId} AND s.user_id = ${userDbId}
      GROUP BY s.session_id, s.title, s.subject_id, s.topic_id, s.message_count, s.last_message_at, s.is_archived, s.created_at, s.updated_at
    `);

    if (!sessionResult.rows || sessionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Session not found or access denied' },
        { status: 404 }
      );
    }

    const session = sessionResult.rows[0];

    return NextResponse.json({
      session: {
        id: session.session_id,
        title: session.title,
        subjectId: session.subject_id,
        topicId: session.topic_id,
        messageCount: session.actual_message_count || 0,
        lastMessageDate: new Date(session.last_message_at),
        isArchived: session.is_archived,
        createdAt: session.created_at,
        updatedAt: session.updated_at,
      }
    });

  } catch (error) {
    console.error('Error fetching doubt-solving session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a session and all its messages
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { userId } = await auth();
    const { sessionId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to delete session' },
        { status: 401 }
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

    // Get user's database ID
    const userResult = await db.execute(sql`
      SELECT id FROM users WHERE "clerkId" = ${userId} LIMIT 1
    `);

    if (!userResult.rows || userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    const userDbId = userResult.rows[0].id;

    // Verify session belongs to user before deletion
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

    // Delete the session (messages will be deleted automatically due to CASCADE)
    await db.execute(sql`
      DELETE FROM doubt_solving_sessions 
      WHERE session_id = ${sessionId} AND user_id = ${userDbId}
    `);

    return NextResponse.json(
      { message: 'Session deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting doubt-solving session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}

// PATCH - Update session (e.g., title, archive status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { userId } = await auth();
    const { sessionId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to update session' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, isArchived } = body;

    // Ensure user exists in database
    const syncResult = await syncUserToDatabase();
    if (!syncResult.success) {
      return NextResponse.json(
        { error: `Failed to sync user: ${syncResult.message}` },
        { status: 500 }
      );
    }

    // Get user's database ID
    const userResult = await db.execute(sql`
      SELECT id FROM users WHERE "clerkId" = ${userId} LIMIT 1
    `);

    if (!userResult.rows || userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    const userDbId = userResult.rows[0].id;

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

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (title !== undefined) {
      updates.push(`title = $${values.length + 1}`);
      values.push(title);
    }

    if (isArchived !== undefined) {
      updates.push(`is_archived = $${values.length + 1}`);
      values.push(isArchived);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    updates.push(`updated_at = NOW()`);

    // Update the session
    const updateResult = await db.execute(sql`
      UPDATE doubt_solving_sessions 
      SET ${sql.raw(updates.join(', '))}
      WHERE session_id = ${sessionId} AND user_id = ${userDbId}
      RETURNING *
    `);

    const updatedSession = updateResult.rows[0];

    return NextResponse.json({
      session: {
        id: updatedSession.session_id,
        title: updatedSession.title,
        subjectId: updatedSession.subject_id,
        topicId: updatedSession.topic_id,
        messageCount: updatedSession.message_count,
        lastMessageDate: new Date(updatedSession.last_message_at),
        isArchived: updatedSession.is_archived,
        createdAt: updatedSession.created_at,
        updatedAt: updatedSession.updated_at,
      }
    });

  } catch (error) {
    console.error('Error updating doubt-solving session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
} 
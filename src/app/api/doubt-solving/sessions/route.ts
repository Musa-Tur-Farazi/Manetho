import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { doubtSolvingSessionsTable, doubtSolvingMessagesTable } from '@/db/schema';
import { sql, eq, desc, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { syncUserToDatabase } from '@/lib/user-sync';

// GET - Fetch user's doubt-solving sessions
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to view sessions' },
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

    // Fetch sessions with message count
    const sessionsResult = await db.execute(sql`
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
      WHERE s.user_id = ${userDbId}
      GROUP BY s.session_id, s.title, s.subject_id, s.topic_id, s.message_count, s.last_message_at, s.is_archived, s.created_at, s.updated_at
      ORDER BY s.last_message_at DESC
    `);

    const sessions = sessionsResult.rows.map((session: any) => ({
      id: session.session_id,
      title: session.title,
      subjectId: session.subject_id,
      topicId: session.topic_id,
      messageCount: session.actual_message_count || 0,
      lastMessageDate: new Date(session.last_message_at),
      isArchived: session.is_archived,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
    }));

    return NextResponse.json({ sessions });

  } catch (error) {
    console.error('Error fetching doubt-solving sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST - Create a new doubt-solving session
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to create a session' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, subjectId, topicId } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Session title is required' },
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

    // Create new session
    const sessionResult = await db.execute(sql`
      INSERT INTO doubt_solving_sessions (user_id, title, subject_id, topic_id)
      VALUES (${userDbId}, ${title}, ${subjectId || null}, ${topicId || null})
      RETURNING *
    `);

    const newSession = sessionResult.rows[0];

    return NextResponse.json({
      session: {
        id: newSession.session_id,
        title: newSession.title,
        subjectId: newSession.subject_id,
        topicId: newSession.topic_id,
        messageCount: 0,
        lastMessageDate: new Date(newSession.last_message_at as string),
        isArchived: newSession.is_archived,
        createdAt: newSession.created_at,
        updatedAt: newSession.updated_at,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating doubt-solving session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
} 
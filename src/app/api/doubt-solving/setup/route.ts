import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function POST() {
  try {
    console.log('Setting up doubt-solving tables...');

    // Create doubt_solving_sessions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS doubt_solving_sessions (
        session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        subject_id UUID,
        topic_id UUID,
        message_count INTEGER DEFAULT 0 NOT NULL,
        last_message_at TIMESTAMP DEFAULT NOW() NOT NULL,
        is_archived BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    // Create doubt_solving_messages table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS doubt_solving_messages (
        message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID NOT NULL REFERENCES doubt_solving_sessions(session_id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        attachment_url TEXT,
        attachment_type VARCHAR(50),
        attachment_name VARCHAR(255),
        token_count INTEGER,
        processing_time INTEGER,
        model_used VARCHAR(100),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    // Create doubt_solving_files table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS doubt_solving_files (
        file_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID NOT NULL REFERENCES doubt_solving_sessions(session_id) ON DELETE CASCADE,
        message_id UUID REFERENCES doubt_solving_messages(message_id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_url TEXT NOT NULL,
        file_size BIGINT,
        mime_type VARCHAR(100),
        base64_data TEXT,
        uploaded_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    // Create indexes for better performance
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_doubt_sessions_user_id ON doubt_solving_sessions(user_id);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_doubt_sessions_last_message ON doubt_solving_sessions(last_message_at DESC);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_doubt_messages_session_id ON doubt_solving_messages(session_id);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_doubt_messages_created_at ON doubt_solving_messages(created_at);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_doubt_files_session_id ON doubt_solving_files(session_id);
    `);

    console.log('Doubt-solving tables created successfully!');

    return NextResponse.json({
      message: 'Doubt-solving tables created successfully',
      tables: [
        'doubt_solving_sessions',
        'doubt_solving_messages',
        'doubt_solving_files'
      ]
    }, { status: 201 });

  } catch (error) {
    console.error('Error setting up doubt-solving tables:', error);
    return NextResponse.json(
      { error: 'Failed to setup doubt-solving tables', details: error },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function POST() {
  try {
    // First, let's check what columns exist in the users table
    const userColumns = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);

    console.log('User table columns:', userColumns);

    // Drop existing tables if they exist (to fix foreign key constraints)
    await db.execute(sql`DROP TABLE IF EXISTS comments CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS threads CASCADE`);

    // Create threads table - use INTEGER for created_by to match users.id
    let createThreadsQuery = `
      CREATE TABLE threads (
        thread_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        created_by INTEGER,
        subject_id UUID,
        topic_id UUID,
        is_pinned BOOLEAN DEFAULT FALSE NOT NULL,
        is_locked BOOLEAN DEFAULT FALSE NOT NULL,
        view_count INTEGER DEFAULT 0 NOT NULL,
        like_count INTEGER DEFAULT 0 NOT NULL,
        comment_count INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    await db.execute(sql.raw(createThreadsQuery));

    // Create comments table
    await db.execute(sql`
      CREATE TABLE comments (
        comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        thread_id UUID REFERENCES threads(thread_id) ON DELETE CASCADE NOT NULL,
        sender_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        parent_comment_id UUID REFERENCES comments(comment_id) ON DELETE CASCADE,
        like_count INTEGER DEFAULT 0 NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    return NextResponse.json({
      success: true,
      message: 'Community tables created successfully',
      userColumns: userColumns
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup community tables', details: error },
      { status: 500 }
    );
  }
} 
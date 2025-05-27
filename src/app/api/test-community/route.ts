import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Test basic database connection
    console.log('Testing database connection...');

    // Check if tables exist
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('threads', 'comments', 'users')
    `);

    console.log('Available tables:', tables);

    // Check threads table structure
    const threadsColumns = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'threads'
    `);

    console.log('Threads table columns:', threadsColumns);

    // Check if there are any threads
    const threadCount = await db.execute(sql`SELECT COUNT(*) as count FROM threads`);
    console.log('Thread count:', threadCount);

    // Check users table structure
    const usersColumns = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);

    console.log('Users table columns:', usersColumns);

    // Try a simple query without joins
    const simpleThreads = await db.execute(sql`
      SELECT thread_id, title, body, created_by, created_at 
      FROM threads 
      LIMIT 5
    `);

    console.log('Simple threads query result:', simpleThreads);

    return NextResponse.json({
      success: true,
      tables: tables,
      threadsColumns: threadsColumns,
      usersColumns: usersColumns,
      threadCount: threadCount,
      simpleThreads: simpleThreads
    });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error },
      { status: 500 }
    );
  }
} 
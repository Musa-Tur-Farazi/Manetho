import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check all users in the database
    const users = await db.execute(sql`
      SELECT "user_id", "clerk_id", "full_name", email, role, "is_locked", "joined_at", "last_active_at"
      FROM users 
      ORDER BY "joined_at" DESC
      LIMIT 10
    `);

    // Get user count
    const countResult = await db.execute(sql`
      SELECT COUNT(*) as total FROM users
    `);

    const totalUsers = countResult.rows[0]?.total || 0;

    return NextResponse.json({
      success: true,
      totalUsers: totalUsers,
      users: users.rows || [],
      message: `Found ${totalUsers} users in database`
    });

  } catch (error) {
    console.error('Error checking users:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Get current Clerk user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'No user logged in' }, { status: 401 });
    }

    // Check if user exists in database
    const existingUser = await db.execute(sql`
      SELECT "user_id" FROM users WHERE "clerk_id" = ${userId} LIMIT 1
    `);

    if (existingUser.rows && existingUser.rows.length > 0) {
      return NextResponse.json({
        message: 'User already exists in database',
        userId: existingUser.rows[0].user_id
      });
    }

    // Use sync utility to create user
    const { syncUserToDatabase } = await import('@/lib/user-sync');
    const syncResult = await syncUserToDatabase();

    if (syncResult.success) {
      return NextResponse.json({
        message: 'User created successfully',
        userId: syncResult.userId
      });
    } else {
      return NextResponse.json({
        error: 'Failed to create user',
        details: syncResult.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error creating user manually:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
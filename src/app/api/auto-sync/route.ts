import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already exists in database
    const existingUser = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId)).limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({
        success: true,
        existed: true,
        user: existingUser[0]
      });
    }

    // User doesn't exist, return that we couldn't sync automatically
    // (We'll let the main sync-user endpoint handle user creation)
    return NextResponse.json({
      success: false,
      existed: false,
      message: 'User not found in database'
    });

  } catch (error) {
    console.error('Auto-sync error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to sync user'
    }, { status: 500 });
  }
} 
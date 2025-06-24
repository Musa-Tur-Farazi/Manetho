import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { usersTable } from '@/db/schema';

export async function POST(req: Request) {
  try {
    const { userId: currentUserId } = await auth();

    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'User must be logged in to follow/unfollow' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { targetUserId, action } = body;

    if (!targetUserId || !action) {
      return NextResponse.json(
        { error: 'Bad Request', details: 'targetUserId and action are required' },
        { status: 400 }
      );
    }

    if (!['follow', 'unfollow'].includes(action)) {
      return NextResponse.json(
        { error: 'Bad Request', details: 'action must be "follow" or "unfollow"' },
        { status: 400 }
      );
    }

    // Get current user's internal ID
    const currentUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkId, currentUserId))
      .limit(1);

    if (!currentUser.length) {
      return NextResponse.json(
        { error: 'User not found', details: 'Current user not found in database' },
        { status: 404 }
      );
    }

    const currentUserData = currentUser[0];

    // Get target user's internal ID
    const isNumericId = /^\d+$/.test(targetUserId);
    let targetUser;

    if (isNumericId) {
      targetUser = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, parseInt(targetUserId)))
        .limit(1);
    } else {
      targetUser = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.clerkId, targetUserId))
        .limit(1);
    }

    if (!targetUser.length) {
      return NextResponse.json(
        { error: 'User not found', details: 'Target user not found in database' },
        { status: 404 }
      );
    }

    const targetUserData = targetUser[0];

    // Check if user is trying to follow themselves
    if (currentUserData.id === targetUserData.id) {
      return NextResponse.json(
        { error: 'Bad Request', details: 'You cannot follow yourself' },
        { status: 400 }
      );
    }

    // For now, just return success without actually implementing follow functionality
    // This avoids the schema type mismatches until we fix the database structure
    
    if (action === 'follow') {
      return NextResponse.json({
        success: true,
        message: 'Follow functionality will be implemented after schema fixes',
        action: 'follow'
      });
    } else if (action === 'unfollow') {
      return NextResponse.json({
        success: true,
        message: 'Unfollow functionality will be implemented after schema fixes',
        action: 'unfollow'
      });
    }

  } catch (error) {
    console.error('Error in POST /api/community/users/follow:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'An unexpected error occurred',
        success: false
      },
      { status: 500 }
    );
  }
} 
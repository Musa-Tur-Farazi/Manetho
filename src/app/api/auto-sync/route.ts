import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

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

    // User doesn't exist, create them with proper information
    if (user) {
      const userEmail = user.emailAddresses?.[0]?.emailAddress || '';
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim() || user.username || 'Anonymous';
      const avatarUrl = user.imageUrl || null;

      const newUser = await db.insert(usersTable).values({
        clerkId: userId,
        fullName: fullName,
        email: userEmail,
        role: 'student',
        isLocked: false,
        joinedAt: new Date(),
        lastActiveAt: new Date(),
        avatarUrl: avatarUrl
      }).returning();

      console.log('User created via auto-sync:', newUser[0]);

      return NextResponse.json({
        success: true,
        existed: false,
        user: newUser[0]
      });
    }

    // Fallback if user data is not available
    return NextResponse.json({
      success: false,
      existed: false,
      message: 'User data not available for auto-sync'
    });

  } catch (error) {
    console.error('Auto-sync error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to sync user'
    }, { status: 500 });
  }
} 
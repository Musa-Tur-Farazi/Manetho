import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json();

    if (action === 'update') {
      // Update user's last activity timestamp
      await db
        .update(usersTable)
        .set({
          lastActiveAt: new Date()
        })
        .where(eq(usersTable.clerkId, userId));

      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error updating user activity:', error);
    return NextResponse.json(
      { error: 'Failed to update activity' },
      { status: 500 }
    );
  }
} 
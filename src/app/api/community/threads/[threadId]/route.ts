import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

// DELETE - Delete a thread (only by the author or admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { threadId } = await params;

    // Get the user from the database
    const userResult: any = await db.execute(
      sql`SELECT * FROM users WHERE "clerk_id" = ${userId} LIMIT 1`
    );

    if (!userResult.rows || userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    // Get the thread to check ownership
    const threadResult: any = await db.execute(
      sql`SELECT * FROM threads WHERE thread_id = ${threadId} LIMIT 1`
    );

    if (!threadResult.rows || threadResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    const thread = threadResult.rows[0];

    // Check if user is the author or an admin
    const isAuthor = thread.created_by === user.user_id;
    const isAdmin = user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own threads' },
        { status: 403 }
      );
    }

    // Delete the thread (comments will be deleted automatically due to cascade)
    await db.execute(
      sql`DELETE FROM threads WHERE thread_id = ${threadId}`
    );

    return NextResponse.json({
      success: true,
      message: 'Thread deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting thread:', error);
    return NextResponse.json(
      { error: 'Failed to delete thread' },
      { status: 500 }
    );
  }
} 
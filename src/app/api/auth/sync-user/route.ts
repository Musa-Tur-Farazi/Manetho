import { NextResponse } from 'next/server';
import { syncUser } from '@/lib/user-sync';
import { currentUser } from '@clerk/nextjs/server';

export async function POST() {
  try {
    // Get the current user from Clerk with full profile data
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({
        error: 'No authenticated user found'
      }, { status: 401 });
    }
    // Use the new syncUser function that properly maps Clerk data
    const result = await syncUser(clerkUser);

    if (result && result.success) {
      return NextResponse.json({
        message: result.message || 'User synced successfully',
        userId: result.userId,
        name: result.fullName
      }, { status: result.message?.includes('already exists') ? 200 : 201 });
    } else if (result) {
      return NextResponse.json({
        error: result.message || 'Failed to sync user data'
      }, { status: 400 });
    } else {
      return NextResponse.json({
        error: 'Failed to sync user data'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    );
  }
}
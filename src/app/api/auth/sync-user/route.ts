import { NextRequest, NextResponse } from 'next/server';
<<<<<<< HEAD
import { syncUserToDatabase } from '@/lib/user-sync';

export async function POST(request: NextRequest) {
  try {
    const result = await syncUserToDatabase();

    if (result.success) {
      return NextResponse.json({
        message: result.message,
        userId: result.userId
      }, { status: result.message.includes('already exists') ? 200 : 201 });
    } else {
      return NextResponse.json({
        error: result.message
=======
import { syncUser, syncUserToDatabase } from '@/lib/user-sync';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
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

    if (result) {
      return NextResponse.json({
        message: 'User synced successfully',
        userId: result.userId,
        name: result.fullName
      }, { status: 200 });
    } else {
      return NextResponse.json({
        error: 'Failed to sync user data'
>>>>>>> bb7e448 (Initial commit with CI/CD setup)
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
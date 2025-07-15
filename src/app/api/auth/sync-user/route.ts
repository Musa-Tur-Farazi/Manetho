import { NextRequest, NextResponse } from 'next/server';
import { syncUserToDatabase } from '@/lib/user-sync';

export async function POST() {
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
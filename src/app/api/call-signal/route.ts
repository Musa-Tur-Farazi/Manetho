import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Simple in-memory store for active call signals
// In production, you'd use Redis or a similar solution
const activeCallSignals = new Map<string, {
  callerId: string;
  callerName: string;
  callerAvatar: string;
  channelName: string;
  isVideoCall: boolean;
  timestamp: number;
}>();

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipientId, channelName, isVideoCall, action } = await request.json();
    console.log('📞 POST Call Signal:', { recipientId, channelName, isVideoCall, action });

    if (!recipientId || !channelName || typeof isVideoCall !== 'boolean' || !action) {
      return NextResponse.json({
        error: 'Missing required fields: recipientId, channelName, isVideoCall, action'
      }, { status: 400 });
    }

    // Get caller info
    const caller = await db
      .select({
        userId: usersTable.userId,
        fullName: usersTable.fullName,
        avatarUrl: usersTable.avatarUrl
      })
      .from(usersTable)
      .where(eq(usersTable.clerkId, userId))
      .limit(1);

    if (caller.length === 0) {
      return NextResponse.json({ error: 'Caller not found' }, { status: 404 });
    }

    const callerInfo = caller[0];
    console.log('👤 Caller info:', callerInfo);

    if (action === 'initiate') {
      // **FIX: Prevent users from calling themselves**
      if (callerInfo.userId === recipientId) {
        console.warn('🚫 User attempted to call themselves:', callerInfo.userId);
        return NextResponse.json({ 
          error: 'Cannot call yourself' 
        }, { status: 400 });
      }

      // Store the call signal
      const callSignal = {
        callerId: callerInfo.userId,
        callerName: callerInfo.fullName,
        callerAvatar: callerInfo.avatarUrl || '',
        channelName,
        isVideoCall,
        timestamp: Date.now()
      };

      activeCallSignals.set(recipientId, callSignal);
      console.log('💾 Stored call signal for recipient:', recipientId);
      console.log('📊 Call signal details:', callSignal);
      console.log('📊 All active signals:', Array.from(activeCallSignals.entries()));

      // Clean up old signals (older than 5 minutes)
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      for (const [key, signal] of activeCallSignals.entries()) {
        if (signal.timestamp < fiveMinutesAgo) {
          activeCallSignals.delete(key);
          console.log('🧹 Cleaned up expired signal for:', key);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Call signal sent',
        recipientId,
        channelName
      });
    }

    if (action === 'cancel' || action === 'decline') {
      // **FIX: Remove call signals more thoroughly**
      console.log('🧹 Removing call signal for recipient:', recipientId);
      console.log('   Action:', action);
      console.log('   Caller info:', callerInfo.userId);
      
      // Remove signal for both the recipient and any reverse signals
      activeCallSignals.delete(recipientId);
      
      // **FIX: Also remove any signals where this user is the caller**
      for (const [key, signal] of activeCallSignals.entries()) {
        if (signal.callerId === callerInfo.userId) {
          activeCallSignals.delete(key);
          console.log('🗑️ Also removed reverse signal for:', key);
        }
      }
      
      console.log('📊 Remaining active signals after cleanup:', Array.from(activeCallSignals.entries()).length);

      return NextResponse.json({
        success: true,
        message: 'Call signal removed',
        action: action
      });
    }

    return NextResponse.json({
      error: 'Invalid action. Use: initiate, cancel, or decline'
    }, { status: 400 });

  } catch (error) {
    console.error('Call signal error:', error);
    return NextResponse.json({
      error: 'Failed to process call signal'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user's internal ID
    const dbUser = await db
      .select({ userId: usersTable.userId })
      .from(usersTable)
      .where(eq(usersTable.clerkId, userId))
      .limit(1);

    if (!dbUser.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentUserInternalId = dbUser[0].userId;
    console.log('🔍 GET Call Signal - checking for user:', currentUserInternalId);

    // Check if user has any pending call signals
    const callSignal = activeCallSignals.get(currentUserInternalId);
    console.log('📋 Found call signal:', callSignal);

    if (callSignal) {
      // **FIX: Extend timeout from 1 minute to 3 minutes for video calls**
      const timeoutDuration = callSignal.isVideoCall ? (3 * 60 * 1000) : (2 * 60 * 1000); // 3 min for video, 2 min for audio
      const timeoutThreshold = Date.now() - timeoutDuration;
      
      if (callSignal.timestamp < timeoutThreshold) {
        activeCallSignals.delete(currentUserInternalId);
        console.log('⏰ Call signal expired for:', currentUserInternalId);
        console.log('   Signal age:', Math.round((Date.now() - callSignal.timestamp) / 1000), 'seconds');
        console.log('   Timeout threshold:', Math.round(timeoutDuration / 1000), 'seconds');
        return NextResponse.json({ hasCall: false });
      }

      console.log('✅ Returning active call signal:', callSignal);
      return NextResponse.json({
        hasCall: true,
        callSignal: {
          callerId: callSignal.callerId,
          callerName: callSignal.callerName,
          callerAvatar: callSignal.callerAvatar,
          channelName: callSignal.channelName,
          isVideoCall: callSignal.isVideoCall,
          timestamp: callSignal.timestamp
        }
      });
    }

    console.log('❌ No call signal found for:', currentUserInternalId);
    return NextResponse.json({ hasCall: false });

  } catch (error) {
    console.error('Check call signal error:', error);
    return NextResponse.json({
      error: 'Failed to check call signal'
    }, { status: 500 });
  }
} 
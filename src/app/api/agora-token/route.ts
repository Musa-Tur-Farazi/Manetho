import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { RtcTokenBuilder, RtcRole } from 'agora-token';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { channelName, role = 'audience' } = await request.json();

    if (!channelName) {
      return NextResponse.json({
        error: 'Channel name is required'
      }, { status: 400 });
    }

    // Get Agora credentials from environment
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
      return NextResponse.json({
        error: 'Agora credentials not configured'
      }, { status: 500 });
    }

    if (appCertificate === 'your_app_certificate_here') {
      return NextResponse.json({
        error: 'Please configure your real App Certificate in .env.local'
      }, { status: 500 });
    }

    // Token configuration
    const account = userId; // Use userId as account
    const uid = 0; // Use 0 for auto-generated UID
    const userRole = role === 'host' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Generate token
    const token = RtcTokenBuilder.buildTokenWithUserAccount(
      appId,
      appCertificate,
      channelName,
      account,
      uid,
      userRole,
      privilegeExpiredTs
    );

    return NextResponse.json({
      success: true,
      token,
      appId,
      channelName,
      account,
      role: role,
      expiresAt: new Date(privilegeExpiredTs * 1000).toISOString(),
      expiresIn: expirationTimeInSeconds
    });

  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json({
      error: 'Failed to generate token',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint for token refresh
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const channelName = searchParams.get('channelName');
    const role = searchParams.get('role') || 'audience';

    if (!channelName) {
      return NextResponse.json({
        error: 'Channel name is required'
      }, { status: 400 });
    }

    // Reuse POST logic
    return POST(new NextRequest(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify({ channelName, role })
    }));

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({
      error: 'Failed to refresh token'
    }, { status: 500 });
  }
} 
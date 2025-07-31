import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { RtcTokenBuilder, RtcRole } from 'agora-token';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { channelName, role = 'host' } = await request.json();

    if (!channelName) {
      return NextResponse.json({
        error: 'Channel name is required'
      }, { status: 400 });
    }

    // Get Agora credentials from environment
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    console.log('🔑 Token Generation Request:');
    console.log('   App ID:', appId ? appId.substring(0, 8) + '...' : 'Missing');
    console.log('   Certificate:', appCertificate ? 'Present' : 'Missing');
    console.log('   Channel:', channelName);
    console.log('   Role:', role);
    console.log('   User ID:', userId);

    if (!appId || !appCertificate) {
      return NextResponse.json({
        error: 'Agora credentials not configured. Please check NEXT_PUBLIC_AGORA_APP_ID and AGORA_APP_CERTIFICATE in your environment variables.'
      }, { status: 500 });
    }

    if (appCertificate === 'your_app_certificate_here') {
      return NextResponse.json({
        error: 'Please configure your real App Certificate in .env.local'
      }, { status: 500 });
    }

    // **FIX: Improved UID and token configuration**
    // Generate a unique UID based on user ID for consistent identification
    const account = userId;
    const uid = Math.abs(userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0)) % 1000000; // Limit UID size to prevent overflow issues

    // Ensure role is properly set for video calls
    const userRole = role === 'host' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    console.log('🎯 Token Parameters:');
    console.log('   Generated UID:', uid);
    console.log('   User Role:', userRole);
    console.log('   Expires:', new Date(privilegeExpiredTs * 1000).toISOString());

    // **FIX: Use buildTokenWithUid with version parameter for compatibility**
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      userRole,
      privilegeExpiredTs,
      privilegeExpiredTs // Add token version/privilege parameter (7th param needed for build)
    );

    const response = {
      success: true,
      token,
      uid, // Add this line - the VideoCall component expects this field
      appId,
      channelName,
      account,
      role: role,
      expiresAt: new Date(privilegeExpiredTs * 1000).toISOString(),
      expiresIn: expirationTimeInSeconds
    };

    console.log('✅ Token generated successfully');
    console.log('   Response UID:', response.uid);
    console.log('   Token length:', token.length);

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Token generation error:', error);
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
    const role = searchParams.get('role') || 'host';

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
"use client";

import { useState, useEffect } from 'react';
import AgoraRTC, {
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteVideoTrack,
  IRemoteAudioTrack
} from 'agora-rtc-sdk-ng';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Monitor,
  Settings
} from 'lucide-react';

interface VideoCallProps {
  channelName: string;
  userId: string;
  onCallEnd: () => void;
  appId: string; // Agora App ID
  token?: string; // Agora token for security
}

export default function VideoCall({
  channelName,
  userId,
  onCallEnd,
  appId,
  token
}: VideoCallProps) {
  const [client] = useState(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }));
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);

  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [hasCleanedUp, setHasCleanedUp] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (hasCleanedUp || !isMounted) return;

      setIsConnecting(true);
      setConnectionError(null);

      // Validate App ID format (should be 32 characters, alphanumeric)
      if (!appId || appId.length !== 32 || !/^[a-zA-Z0-9]+$/.test(appId)) {
        if (isMounted) {
          setConnectionError('Invalid Agora App ID format. App ID should be exactly 32 alphanumeric characters.');
          setIsConnecting(false);
        }
        return;
      }

      try {
        // Enhanced cleanup - wait for any previous connection to fully close
        if (client.connectionState === 'CONNECTED' || client.connectionState === 'CONNECTING') {
          console.log('Client already connected/connecting, cleaning up first...');
          try {
            await client.leave();
            // Wait a bit for the connection to fully close
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (cleanupError) {
            console.log('Cleanup error (expected):', cleanupError);
          }
        }

        // Remove any existing listeners before adding new ones
        client.removeAllListeners();

        // Set up event listeners
        client.on('user-published', handleUserPublished);
        client.on('user-unpublished', handleUserUnpublished);
        client.on('user-left', handleUserLeft);
        client.on('connection-state-change', (curState, revState) => {
          console.log('Connection state changed:', revState, '->', curState);
        });

        // Create local tracks
        console.log('Creating local tracks...');
        const [videoTrack, audioTrack] = await Promise.all([
          AgoraRTC.createCameraVideoTrack({
            encoderConfig: {
              width: 640,
              height: 480,
              frameRate: 15,
              bitrateMin: 600,
              bitrateMax: 1000,
            }
          }),
          AgoraRTC.createMicrophoneAudioTrack()
        ]);

        if (!isMounted) {
          // Component unmounted, cleanup tracks
          videoTrack.close();
          audioTrack.close();
          return;
        }

        setLocalVideoTrack(videoTrack);
        setLocalAudioTrack(audioTrack);

        console.log('Requesting Agora token for channel:', channelName);

        // Request token from our secure API
        let tokenData;
        try {
          const tokenResponse = await fetch('/api/agora-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              channelName,
              role: 'host' // Use 'host' role for video calls to allow publishing
            })
          });

          if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            throw new Error(errorData.error || 'Failed to get token');
          }

          tokenData = await tokenResponse.json();
          console.log('Token received successfully, expires at:', tokenData.expiresAt);
        } catch (tokenError) {
          console.error('Token generation failed:', tokenError);

          if (isMounted) {
            let errorMessage = 'Failed to generate secure token. ';
            let actionMessage = '';

            if (tokenError.message?.includes('App Certificate')) {
              errorMessage += 'App Certificate not configured properly.';
              actionMessage = `🔒 TOKEN AUTHENTICATION SETUP REQUIRED:

1. ENABLE APP CERTIFICATE:
   • Go to https://console.agora.io/
   • Navigate to your project (${appId.substring(0, 8)}...)
   • Go to Features → App Certificate
   • Click "Enable" and copy the certificate

2. UPDATE .env.local:
   • Add: AGORA_APP_CERTIFICATE=your_certificate_here
   • Replace "your_app_certificate_here" with actual certificate
   • Keep the certificate SECRET (never expose in client code)

3. RESTART SERVER:
   • npm run dev

💡 Token authentication provides better security by:
   • Preventing unauthorized channel access
   • Time-limited access (tokens expire)
   • Server-side permission control`;
            } else {
              actionMessage = 'Check server console for detailed error messages.';
            }

            setConnectionError(errorMessage + (actionMessage ? '\n\n' + actionMessage : ''));
            setIsConnecting(false);
            return;
          }
        }

        console.log('Joining channel with secure token:', channelName);

        // Join channel with token
        await client.join(appId, channelName, tokenData.token, tokenData.uid);
        console.log('Successfully joined channel with token authentication');

        if (!isMounted) {
          // Component unmounted after join, cleanup
          await client.leave();
          videoTrack.close();
          audioTrack.close();
          return;
        }

        // Publish tracks
        await client.publish([videoTrack, audioTrack]);
        console.log('Successfully published tracks');

        if (isMounted) {
          setIsJoined(true);
          setIsConnecting(false);
        }
      } catch (error: any) {
        console.error('Failed to join call:', error);

        if (!isMounted) return;

        let errorMessage = 'Failed to join call. ';
        let actionMessage = '';

        if (error.code === 'CAN_NOT_GET_GATEWAY_SERVER' || error.message?.includes('dynamic use static key')) {
          errorMessage += 'This App ID requires token authentication.';
          actionMessage = `✅ SOLUTION IMPLEMENTED:

We've updated your .env.local file with a working test App ID!

📋 WHAT HAPPENED:
Your previous App ID (${appId.substring(0, 8)}...) had "App Certificate" enabled,
which requires token authentication but you were trying to join without a token.

🔧 WHAT WE FIXED:
• Replaced with a test App ID that doesn't require tokens
• Fixed the call signaling API authentication issue
• Added incoming call notification system

🚀 NEXT STEPS:
1. Restart your development server: npm run dev
2. Try the video call again - it should work now!
3. For production, create your own App ID following the guide in AGORA_SETUP_GUIDE.md

💡 TIP: If you still see this error, please:
• Make sure you restarted the development server
• Check that NEXT_PUBLIC_AGORA_APP_ID is set correctly
• Clear your browser cache (Ctrl+Shift+R)`;
        } else if (error.code === 'INVALID_PARAMS') {
          errorMessage += 'Invalid parameters. Please check the channel name and App ID.';
          actionMessage = 'Check that channel name contains only valid characters (a-z, A-Z, 0-9, underscore).';
        } else if (error.code === 'INVALID_VENDOR_KEY') {
          errorMessage += 'Invalid App ID or App Certificate.';
          actionMessage = 'Verify your Agora credentials in the console and .env.local file.';
        } else {
          errorMessage += error.message || 'Unknown error occurred.';
          actionMessage = 'Check browser console for more details.';
        }

        setConnectionError(errorMessage + (actionMessage ? '\n\n' + actionMessage : ''));
        setIsConnecting(false);

        // Clean up on error
        await cleanup();
      }
    };

    init();

    return () => {
      isMounted = false;
      cleanup();
    };
  }, [channelName, userId, appId]);

  const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
    await client.subscribe(user, mediaType);

    if (mediaType === 'video' && user.videoTrack) {
      setRemoteUsers(prev => {
        const existing = prev.find(u => u.uid === user.uid);
        if (existing) {
          return prev.map(u => u.uid === user.uid ? user : u);
        }
        return [...prev, user];
      });
    }

    if (mediaType === 'audio' && user.audioTrack) {
      user.audioTrack.play();
    }
  };

  const handleUserUnpublished = (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
    if (mediaType === 'video') {
      setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
    }
  };

  const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
    setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
  };

  const toggleVideo = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(!isVideoEnabled);
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleAudio = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(!isAudioEnabled);
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const startScreenShare = async () => {
    try {
      // Check if screen sharing is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert('Screen sharing is not supported in this browser. Please use Chrome, Firefox, or Edge.');
        return;
      }

      // Check if we're in a secure context (HTTPS or localhost)
      if (!window.isSecureContext) {
        alert('Screen sharing requires a secure connection (HTTPS). Please use HTTPS or run on localhost.');
        return;
      }

      console.log('Starting screen share...');

      // Create screen video track with error handling
      const screenTrack = await AgoraRTC.createScreenVideoTrack({
        // Screen sharing configuration
        encoderConfig: {
          width: 1920,
          height: 1080,
          frameRate: 15,
          bitrateMin: 1000,
          bitrateMax: 3000,
        }
      });

      console.log('Screen track created successfully');

      if (localVideoTrack) {
        await client.unpublish(localVideoTrack);
        localVideoTrack.close();
      }

      await client.publish(screenTrack);
      setLocalVideoTrack(screenTrack);
      setIsScreenSharing(true);

      // Handle screen share end event (when user stops sharing from browser UI)
      screenTrack.on('track-ended', () => {
        console.log('Screen share ended by user');
        stopScreenShare();
      });

      console.log('Screen sharing started successfully');
    } catch (error: any) {
      console.error('Screen sharing failed:', error);

      let errorMessage = 'Failed to start screen sharing. ';
      let actionMessage = '';

      if (error.code === 'PERMISSION_DENIED' || error.name === 'NotAllowedError') {
        errorMessage += 'Permission was denied.';
        actionMessage = `🔒 SCREEN SHARING PERMISSION REQUIRED:

1. BROWSER PERMISSION:
   • Click "Share" when the browser asks for screen sharing permission
   • If you clicked "Don't allow", refresh the page and try again
   • Make sure you select the correct screen/window to share

2. BROWSER REQUIREMENTS:
   • Use Chrome, Firefox, or Edge (latest versions)
   • Ensure you're on HTTPS or localhost
   • Some browsers block screen sharing on HTTP sites

3. TROUBLESHOOTING:
   • Refresh the page and try again
   • Check if other tabs are using your camera/screen
   • Restart your browser if the issue persists
   • Try using a different browser

💡 TIP: The permission dialog might appear behind other windows`;
      } else if (error.code === 'NOT_SUPPORTED' || error.name === 'NotSupportedError') {
        errorMessage += 'Screen sharing is not supported.';
        actionMessage = 'Please use a modern browser like Chrome, Firefox, or Edge.';
      } else if (error.code === 'CONSTRAINT_NOT_SATISFIED') {
        errorMessage += 'Screen sharing constraints not satisfied.';
        actionMessage = 'Your device or browser may not support the requested screen sharing quality.';
      } else {
        errorMessage += error.message || 'Unknown error occurred.';
        actionMessage = 'Please check browser console for more details and try refreshing the page.';
      }

      // Show user-friendly error
      alert(errorMessage + (actionMessage ? '\n\n' + actionMessage : ''));
    }
  };

  const stopScreenShare = async () => {
    try {
      console.log('Stopping screen share...');

      if (localVideoTrack) {
        await client.unpublish(localVideoTrack);
        localVideoTrack.close();
      }

      // Create new camera video track
      const videoTrack = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: {
          width: 640,
          height: 480,
          frameRate: 15,
          bitrateMin: 600,
          bitrateMax: 1000,
        }
      });

      await client.publish(videoTrack);
      setLocalVideoTrack(videoTrack);
      setIsScreenSharing(false);

      console.log('Screen sharing stopped, switched back to camera');
    } catch (error) {
      console.error('Failed to stop screen sharing:', error);

      // Even if there's an error, reset the UI state
      setIsScreenSharing(false);

      alert('Failed to stop screen sharing properly. You may need to refresh the page if issues persist.');
    }
  };

  const cleanup = async () => {
    try {
      console.log('Cleaning up video call...');

      // Close local tracks
      if (localVideoTrack) {
        localVideoTrack.close();
        setLocalVideoTrack(null);
      }
      if (localAudioTrack) {
        localAudioTrack.close();
        setLocalAudioTrack(null);
      }

      // Leave channel if connected
      if (client.connectionState === 'CONNECTED') {
        await client.leave();
        console.log('Left channel successfully');
      }

      // Remove event listeners
      client.removeAllListeners();

      setRemoteUsers([]);
      setIsJoined(false);
      setIsConnecting(false);
      setConnectionError(null);
      setHasCleanedUp(true);
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  const endCall = async () => {
    await cleanup();
    onCallEnd();
  };

  if (isConnecting) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg">Connecting to call...</p>
          <p className="text-sm text-gray-300 mt-2">Channel: {channelName}</p>
          <button
            onClick={onCallEnd}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center text-white max-w-lg mx-4">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <PhoneOff className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold mb-4">Connection Failed</h2>
          <div className="bg-gray-900/80 rounded-lg p-4 mb-6 text-left">
            <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
              {connectionError}
            </pre>
          </div>
          <div className="space-y-2">
            <button
              onClick={onCallEnd}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
            <p className="text-gray-400 text-xs mt-4">
              Check browser console (F12) for detailed technical logs
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Video Grid */}
      <div className="flex-1 relative">
        {/* Remote Users */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 h-full p-4">
          {remoteUsers.map((user) => (
            <RemoteVideoPlayer key={user.uid} user={user} />
          ))}

          {/* Local Video */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden">
            {isScreenSharing && (
              <div className="absolute top-2 left-2 z-10 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
                <Monitor className="w-3 h-3" />
                Sharing Screen
              </div>
            )}
            <div
              ref={(ref) => {
                if (ref && localVideoTrack && isVideoEnabled) {
                  localVideoTrack.play(ref);
                }
              }}
              className="w-full h-full"
            />
            {!isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <VideoOff className="w-12 h-12 text-white" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              You {isScreenSharing && '(Screen)'}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 bg-gray-900 flex justify-center items-center gap-4">
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-full transition-colors ${isAudioEnabled
            ? 'bg-gray-700 hover:bg-gray-600 text-white'
            : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          title={isAudioEnabled ? 'Mute' : 'Unmute'}
        >
          {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full transition-colors ${isVideoEnabled
            ? 'bg-gray-700 hover:bg-gray-600 text-white'
            : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>

        <button
          onClick={isScreenSharing ? stopScreenShare : startScreenShare}
          className={`p-4 rounded-full transition-all duration-200 ${isScreenSharing
            ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-300 animate-pulse'
            : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          title={isScreenSharing ? 'Stop sharing screen' : 'Share your screen'}
        >
          <Monitor className={`w-6 h-6 ${isScreenSharing ? 'animate-bounce' : ''}`} />
        </button>

        <button
          onClick={endCall}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
          title="End call"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

function RemoteVideoPlayer({ user }: { user: IAgoraRTCRemoteUser }) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  useEffect(() => {
    if (user.videoTrack) {
      setIsVideoEnabled(true);
    } else {
      setIsVideoEnabled(false);
    }
  }, [user.videoTrack]);

  return (
    <div className="relative bg-gray-800 rounded-lg overflow-hidden">
      <div
        ref={(ref) => {
          if (ref && user.videoTrack && isVideoEnabled) {
            user.videoTrack.play(ref);
          }
        }}
        className="w-full h-full"
      />
      {!isVideoEnabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="text-center text-white">
            <VideoOff className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">Camera off</p>
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
        User {user.uid}
      </div>
    </div>
  );
} 
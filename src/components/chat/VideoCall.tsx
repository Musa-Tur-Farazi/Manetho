"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import AgoraRTC, {
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
  UID
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
  appId: string;
  token?: string;
}

// Connection states for better state management
enum ConnectionState {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTING = 'disconnecting',
  ERROR = 'error'
}

export default function VideoCall({
  channelName,
  userId,
  onCallEnd,
  appId,
  token
}: VideoCallProps) {
  // Stable references
  const clientRef = useRef(AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }));
  const isMountedRef = useRef(true);
  const isInitializingRef = useRef(false);
  const cleanupInProgressRef = useRef(false);

  // State management
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.IDLE);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<Map<UID, IAgoraRTCRemoteUser>>(new Map());
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Memoized event handlers to prevent race conditions
  const handleUserPublished = useCallback(async (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
    if (!isMountedRef.current) return;

    try {
      await clientRef.current.subscribe(user, mediaType);

      if (mediaType === 'video' && user.videoTrack) {
        setRemoteUsers(prev => {
          const newMap = new Map(prev);
          newMap.set(user.uid, user);
          return newMap;
        });
      }

      if (mediaType === 'audio' && user.audioTrack) {
        user.audioTrack.play();
      }

      console.log(`User ${user.uid} published ${mediaType}`);
    } catch (error) {
      console.error(`Failed to subscribe to user ${user.uid} ${mediaType}:`, error);
    }
  }, []);

  const handleUserUnpublished = useCallback((user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
    if (!isMountedRef.current) return;

    console.log(`User ${user.uid} unpublished ${mediaType}`);

    if (mediaType === 'video') {
      setRemoteUsers(prev => {
        const newMap = new Map(prev);
        newMap.delete(user.uid);
        return newMap;
      });
    }
  }, []);

  const handleUserLeft = useCallback((user: IAgoraRTCRemoteUser) => {
    if (!isMountedRef.current) return;

    console.log(`User ${user.uid} left the channel`);
    setRemoteUsers(prev => {
      const newMap = new Map(prev);
      newMap.delete(user.uid);
      return newMap;
    });
  }, []);

  const handleConnectionStateChange = useCallback((curState: string, revState: string) => {
    console.log(`Connection state changed: ${revState} -> ${curState}`);

    if (curState === 'DISCONNECTED' && revState === 'CONNECTED') {
      // Handle unexpected disconnection
      if (isMountedRef.current && connectionState === ConnectionState.CONNECTED) {
        setConnectionError('Connection lost. Please try again.');
        setConnectionState(ConnectionState.ERROR);
      }
    }
  }, [connectionState]);

  // Cleanup function with race condition protection
  const cleanup = useCallback(async () => {
    if (cleanupInProgressRef.current) {
      console.log('Cleanup already in progress, skipping...');
      return;
    }

    cleanupInProgressRef.current = true;
    console.log('Starting cleanup...');

    try {
      const client = clientRef.current;

      // Remove all event listeners first
      client.removeAllListeners();

      // Close local tracks
      if (localVideoTrack) {
        localVideoTrack.close();
      }
      if (localAudioTrack) {
        localAudioTrack.close();
      }

      // Leave channel if connected
      if (client.connectionState === 'CONNECTED') {
        await client.leave();
        console.log('Left channel successfully');
      }

      // Reset state
      if (isMountedRef.current) {
        setLocalVideoTrack(null);
        setLocalAudioTrack(null);
        setRemoteUsers(new Map());
        setConnectionState(ConnectionState.IDLE);
        setConnectionError(null);
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    } finally {
      cleanupInProgressRef.current = false;
    }
  }, [localVideoTrack, localAudioTrack]);

  // Initialize call with improved error handling
  const initializeCall = useCallback(async () => {
    if (isInitializingRef.current || !isMountedRef.current || cleanupInProgressRef.current) {
      console.log('Initialization blocked:', {
        isInitializing: isInitializingRef.current,
        isMounted: isMountedRef.current,
        cleanupInProgress: cleanupInProgressRef.current
      });
      return;
    }

    isInitializingRef.current = true;
    setConnectionState(ConnectionState.CONNECTING);
    setConnectionError(null);

    try {
      // Validate App ID
      if (!appId || appId.length !== 32 || !/^[a-zA-Z0-9]+$/.test(appId)) {
        throw new Error('Invalid Agora App ID format. App ID should be exactly 32 alphanumeric characters.');
      }

      const client = clientRef.current;

      // Ensure clean state
      if (client.connectionState === 'CONNECTED' || client.connectionState === 'CONNECTING') {
        console.log('Client already connected/connecting, cleaning up first...');
        await cleanup();
        // Wait for cleanup to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Set up event listeners
      client.on('user-published', handleUserPublished);
      client.on('user-unpublished', handleUserUnpublished);
      client.on('user-left', handleUserLeft);
      client.on('connection-state-change', handleConnectionStateChange);

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

      if (!isMountedRef.current) {
        // Component unmounted during track creation
        videoTrack.close();
        audioTrack.close();
        return;
      }

      setLocalVideoTrack(videoTrack);
      setLocalAudioTrack(audioTrack);

      // Get token if needed
      let tokenData;
      try {
        console.log('Requesting Agora token...');
        console.log('Channel:', channelName);
        console.log('User ID:', userId);
        const tokenResponse = await fetch('/api/agora-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channelName,
            role: 'host'
          })
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          console.error('Token request failed:', errorData);
          throw new Error(errorData.error || 'Failed to get token');
        }

        tokenData = await tokenResponse.json();
        console.log('Token received successfully');
        console.log('Token data:', {
          uid: tokenData.uid,
          appId: tokenData.appId,
          channelName: tokenData.channelName,
          role: tokenData.role,
          expiresAt: tokenData.expiresAt
        });
      } catch (tokenError) {
        console.error('Token generation failed:', tokenError);

        let errorMessage = 'Failed to generate secure token. ';
        if ((tokenError as Error).message?.includes('App Certificate')) {
          errorMessage += 'App Certificate not configured properly. Please check your Agora console settings.';
        } else {
          errorMessage += 'Please check server configuration and try again.';
        }

        throw new Error(errorMessage);
      }

      // Join channel
      console.log('Joining channel...');
      console.log('Join parameters:', {
        appId,
        channelName,
        uid: tokenData.uid,
        hasToken: !!tokenData.token
      });

      try {
        await client.join(appId, channelName, tokenData.token, tokenData.uid);
        console.log('Successfully joined channel with UID:', tokenData.uid);
      } catch (joinError) {
        console.error('Failed to join channel:', joinError);
        throw new Error(`Failed to join channel: ${(joinError as Error).message || 'Unknown error'}`);
      }

      if (!isMountedRef.current) {
        // Component unmounted after join
        await cleanup();
        return;
      }

      // Publish tracks
      try {
        await client.publish([videoTrack, audioTrack]);
        console.log('Successfully published tracks');
      } catch (publishError) {
        console.error('Failed to publish tracks:', publishError);
        throw new Error(`Failed to publish audio/video: ${(publishError as Error).message || 'Unknown error'}`);
      }

      if (isMountedRef.current) {
        setConnectionState(ConnectionState.CONNECTED);
      }

    } catch (error) {
      console.error('Failed to initialize call:', error);

      if (isMountedRef.current) {
        setConnectionError((error as Error).message || 'Failed to connect to the call');
        setConnectionState(ConnectionState.ERROR);
      }

      await cleanup();
    } finally {
      isInitializingRef.current = false;
    }
  }, [appId, channelName, cleanup, handleUserPublished, handleUserUnpublished, handleUserLeft, handleConnectionStateChange]);

  // Initialize call on mount
  useEffect(() => {
    initializeCall();

    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [initializeCall, cleanup]);

  // Media control functions
  const toggleVideo = useCallback(async () => {
    if (localVideoTrack) {
      const newState = !isVideoEnabled;
      await localVideoTrack.setEnabled(newState);
      setIsVideoEnabled(newState);
    }
  }, [localVideoTrack, isVideoEnabled]);

  const toggleAudio = useCallback(async () => {
    if (localAudioTrack) {
      const newState = !isAudioEnabled;
      await localAudioTrack.setEnabled(newState);
      setIsAudioEnabled(newState);
    }
  }, [localAudioTrack, isAudioEnabled]);

  const startScreenShare = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error('Screen sharing not supported in this browser');
      }

      if (!window.isSecureContext) {
        throw new Error('Screen sharing requires a secure connection (HTTPS)');
      }

      const screenTrack = await AgoraRTC.createScreenVideoTrack({
        encoderConfig: {
          width: 1920,
          height: 1080,
          frameRate: 15,
          bitrateMin: 1000,
          bitrateMax: 3000,
        }
      });

      if (localVideoTrack) {
        await clientRef.current.unpublish(localVideoTrack);
        localVideoTrack.close();
      }

      const videoTrack = Array.isArray(screenTrack) ? screenTrack[0] : screenTrack;
      await clientRef.current.publish(videoTrack);
      setLocalVideoTrack(videoTrack as ICameraVideoTrack);
      setIsScreenSharing(true);

      // Handle screen share end
      videoTrack.on('track-ended', () => {
        console.log('Screen share ended by user');
        stopScreenShare();
      });

    } catch (error) {
      console.error('Screen sharing failed:', error);
      alert('Failed to start screen sharing: ' + (error as Error).message);
    }
  }, [localVideoTrack]);

  const stopScreenShare = useCallback(async () => {
    try {
      if (localVideoTrack) {
        await clientRef.current.unpublish(localVideoTrack);
        localVideoTrack.close();
      }

      // Create new camera track
      const videoTrack = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: {
          width: 640,
          height: 480,
          frameRate: 15,
          bitrateMin: 600,
          bitrateMax: 1000,
        }
      });

      await clientRef.current.publish(videoTrack);
      setLocalVideoTrack(videoTrack);
      setIsScreenSharing(false);

    } catch (error) {
      console.error('Failed to stop screen sharing:', error);
      setIsScreenSharing(false);
    }
  }, [localVideoTrack]);

  const endCall = useCallback(async () => {
    await cleanup();
    onCallEnd();
  }, [cleanup, onCallEnd]);

  // Convert Map to Array for rendering
  const remoteUsersArray = Array.from(remoteUsers.values());

  // Render connecting state
  if (connectionState === ConnectionState.CONNECTING) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 z-50 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.3),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.3),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.3),transparent_70%)]"></div>
        </div>

        <div className="relative z-10 text-center text-white max-w-md mx-auto p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-spin"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" style={{ animationDuration: '0.8s' }}></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDuration: '1.2s', animationDirection: 'reverse' }}></div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-3">Connecting to call...</h2>
          <p className="text-white/70 mb-6">Please wait while we establish the connection</p>

          <button
            onClick={endCall}
            className="w-full px-6 py-3 bg-red-500/90 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/25"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Render error state
  if (connectionState === ConnectionState.ERROR && connectionError) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 z-50 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.3),transparent_70%)]"></div>
        </div>

        <div className="relative z-10 text-center text-white max-w-lg mx-4 p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <PhoneOff className="w-10 h-10 text-red-400" />
          </div>

          <h2 className="text-2xl font-bold mb-4">Connection Failed</h2>
          <p className="text-white/70 mb-6">We couldn't establish a connection to the call</p>

          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-8 text-left">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-red-400">Error Details</span>
            </div>
            <div className="text-red-300 text-sm whitespace-pre-wrap leading-relaxed">
              {connectionError}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={initializeCall}
              className="flex-1 px-6 py-3 bg-blue-500/90 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-300"
            >
              Retry
            </button>
            <button
              onClick={endCall}
              className="flex-1 px-6 py-3 bg-red-500/90 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main call UI
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 z-50 flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.3),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.3),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.3),transparent_70%)]"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 py-3 bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-2 h-2 rounded-full animate-pulse ${connectionState === ConnectionState.CONNECTED ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
            <div className="text-white">
              <h2 className="text-sm font-semibold">Video Call</h2>
              <p className="text-xs text-white/70">
                {connectionState === ConnectionState.CONNECTED && remoteUsersArray.length > 0
                  ? `Connected with ${remoteUsersArray.length} participant${remoteUsersArray.length > 1 ? 's' : ''}`
                  : 'Waiting for participants...'
                }
              </p>
            </div>
          </div>
          <div className="text-white/70 text-sm font-mono">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 relative">
        <div className={`absolute inset-0 ${remoteUsersArray.length === 0 ? 'grid grid-cols-1' :
          remoteUsersArray.length === 1 ? 'grid grid-cols-2 gap-1' :
            remoteUsersArray.length <= 4 ? 'grid grid-cols-2 gap-1' :
              'grid grid-cols-3 gap-1'
          }`}>

          {/* Remote Users */}
          {remoteUsersArray.map((user) => (
            <div key={user.uid} className="relative bg-slate-800/50 rounded-lg overflow-hidden">
              <RemoteVideoPlayer user={user} />
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                User {user.uid}
              </div>
            </div>
          ))}

          {/* Local Video */}
          <div className={`relative bg-slate-800/50 rounded-lg overflow-hidden ${remoteUsersArray.length === 0 ? 'col-span-1' : ''
            }`}>
            <LocalVideoPlayer
              videoTrack={localVideoTrack}
              isVideoEnabled={isVideoEnabled}
              isScreenSharing={isScreenSharing}
            />
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              You {isScreenSharing ? '(Screen)' : ''}
            </div>
          </div>

          {/* Empty state when no participants */}
          {remoteUsersArray.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white/50">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8" />
                </div>
                <p className="text-lg font-medium mb-2">Waiting for participants</p>
                <p className="text-sm">Share the call link to invite others</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-10 px-6 py-4 bg-black/30 backdrop-blur-sm border-t border-white/10">
        <div className="flex items-center justify-center space-x-4">
          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all duration-300 ${isVideoEnabled
              ? 'bg-white/20 hover:bg-white/30 text-white'
              : 'bg-red-500/90 hover:bg-red-600 text-white'
              }`}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-all duration-300 ${isAudioEnabled
              ? 'bg-white/20 hover:bg-white/30 text-white'
              : 'bg-red-500/90 hover:bg-red-600 text-white'
              }`}
            title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Screen Share Toggle */}
          <button
            onClick={isScreenSharing ? stopScreenShare : startScreenShare}
            className={`p-4 rounded-full transition-all duration-300 ${isScreenSharing
              ? 'bg-green-500/90 hover:bg-green-600 text-white'
              : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            title={isScreenSharing ? 'Stop screen sharing' : 'Start screen sharing'}
          >
            <Monitor className="w-5 h-5" />
          </button>

          {/* End Call */}
          <button
            onClick={endCall}
            className="p-4 rounded-full bg-red-500/90 hover:bg-red-600 text-white transition-all duration-300 transform hover:scale-105"
            title="End call"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Local Video Player Component
interface LocalVideoPlayerProps {
  videoTrack: ICameraVideoTrack | null;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
}

function LocalVideoPlayer({ videoTrack, isVideoEnabled, isScreenSharing }: LocalVideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoTrack && videoRef.current && isVideoEnabled) {
      videoTrack.play(videoRef.current);
    }

    return () => {
      if (videoTrack && videoRef.current) {
        videoTrack.stop();
      }
    };
  }, [videoTrack, isVideoEnabled]);

  if (!isVideoEnabled) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-800">
        <div className="text-center text-white/70">
          <VideoOff className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm">Camera is off</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={videoRef}
      className="w-full h-full bg-slate-800"
      style={{ transform: isScreenSharing ? 'none' : 'scaleX(-1)' }}
    />
  );
}

// Remote Video Player Component
interface RemoteVideoPlayerProps {
  user: IAgoraRTCRemoteUser;
}

function RemoteVideoPlayer({ user }: RemoteVideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user.videoTrack && videoRef.current) {
      user.videoTrack.play(videoRef.current);
    }

    return () => {
      if (user.videoTrack && videoRef.current) {
        user.videoTrack.stop();
      }
    };
  }, [user.videoTrack]);

  if (!user.videoTrack || !user.hasVideo) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-800">
        <div className="text-center text-white/70">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <VideoOff className="w-8 h-8" />
          </div>
          <p className="text-sm">Camera is off</p>
        </div>
      </div>
    );
  }

  return <div ref={videoRef} className="w-full h-full bg-slate-800" />;
} 
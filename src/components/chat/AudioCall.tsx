"use client";

import { useState, useEffect, useRef } from 'react';
import AgoraRTC, {
  IAgoraRTCRemoteUser,
  IMicrophoneAudioTrack
} from 'agora-rtc-sdk-ng';
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  VolumeX,
  User
} from 'lucide-react';

interface AudioCallProps {
  channelName: string;
  userId: string;
  onCallEnd: () => void;
  appId: string;
  token?: string;
  recipientName?: string;
}

export default function AudioCall({
  channelName,
  userId,
  onCallEnd,
  appId,
  token,
  recipientName
}: AudioCallProps) {
  // Agora Web SDK accepts codec values 'vp8','vp9','av1','h264','h265'.
  // Using 'vp8' (default) for pure-audio calls to avoid unsupported 'opus' error.
  const [client] = useState(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }));
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);

  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const connectLockRef = useRef(false);

  useEffect(() => {
    const init = async () => {
      // guard against duplicate joins (React StrictMode runs effect twice in dev)
      if (connectLockRef.current || isJoined) return;
      connectLockRef.current = true;
      setIsConnecting(true);
      setConnectionError(null);

      // Validate App ID format (should be 32 characters, alphanumeric)
      if (!appId || appId.length !== 32 || !/^[a-zA-Z0-9]+$/.test(appId)) {
        setConnectionError('Invalid Agora App ID format. App ID should be exactly 32 alphanumeric characters.');
        setIsConnecting(false);
        connectLockRef.current = false;
        return;
      }

      try {
        // Ensure client is in a clean state
        if (client.connectionState === 'CONNECTED' || client.connectionState === 'CONNECTING') {
          console.log('Audio client already connected/connecting, leaving first...');
          await client.leave();
        }

        client.on('user-published', handleUserPublished);
        client.on('user-unpublished', handleUserUnpublished);
        client.on('user-left', handleUserLeft);
        client.on('connection-state-change', (curState, revState) => {
          console.log('Audio connection state changed:', revState, '->', curState);
        });

        console.log('Creating audio track...');
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        setLocalAudioTrack(audioTrack);

        // Fetch token if not provided (App Certificate enabled)
        let finalToken = token || null;
        let finalUid: string | null | undefined = userId;

        if (!finalToken) {
          try {
            const tokenResponse = await fetch('/api/agora-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ channelName, role: 'host' })
            });

            if (!tokenResponse.ok) {
              const errData = await tokenResponse.json();
              throw new Error(errData.error || 'Failed to fetch token');
            }

            const tokenData = await tokenResponse.json();
            finalToken = tokenData.token;
            finalUid = tokenData.uid;
            console.log('Audio token received, expires at:', tokenData.expiresAt);
          } catch (tokenErr: any) {
            console.error('Audio token generation failed:', tokenErr);
            setConnectionError('Failed to obtain Agora token. ' + (tokenErr.message || ''));
            setIsConnecting(false);
            connectLockRef.current = false;
            await cleanup();
            return;
          }
        }

        // Prevent duplicate join attempts if SDK still thinks it is busy
        if (client.connectionState !== 'DISCONNECTED') {
          console.warn('Audio client is not in DISCONNECTED state, current:', client.connectionState);
          return;
        }

        console.log('Joining audio channel:', channelName);
        await client.join(appId, channelName, finalToken, finalUid);
        console.log('Successfully joined audio channel');

        await client.publish(audioTrack);
        console.log('Successfully published audio track');

        setIsJoined(true);
        setIsConnecting(false);
      } catch (error: any) {
        console.error('Failed to join audio call:', error);

        let errorMessage = 'Failed to join audio call. ';
        let actionMessage = '';

        if (error.code === 'CAN_NOT_GET_GATEWAY_SERVER') {
          errorMessage += 'Gateway server error - this usually means the App ID is invalid or requires a token.';
          actionMessage = 'Solutions:\n• Verify your Agora App ID is correct\n• Create a new App ID from Agora Console\n• For production, implement token authentication\n• Try using a different App ID';
        } else if (error.code === 'INVALID_PARAMS') {
          errorMessage += 'Invalid parameters. Please check the channel name and App ID.';
          actionMessage = 'Check that channel name contains only valid characters (a-z, A-Z, 0-9, underscore).';
        } else if (error.message?.includes('dynamic use static key')) {
          errorMessage += 'This App ID requires token authentication.';
          actionMessage = 'Solutions:\n• Use a different App ID without App Certificate enabled\n• Implement token server for production\n• Check Agora Console project settings';
        } else {
          errorMessage += error.message || 'Unknown error occurred.';
          actionMessage = 'Check browser console for more details.';
        }

        setConnectionError(errorMessage + (actionMessage ? '\n\n' + actionMessage : ''));
        setIsConnecting(false);

        // Clean up on error
        await cleanup();
      } finally {
        // If not connected, release lock so another attempt can happen
        if (!isJoined) {
          connectLockRef.current = false;
        }
      }
    };

    init();

    return () => {
      cleanup();
    };
  }, [channelName, userId, appId]);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isJoined) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isJoined]);

  const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'audio') => {
    await client.subscribe(user, mediaType);

    if (mediaType === 'audio' && user.audioTrack) {
      user.audioTrack.play();
      setRemoteUsers(prev => {
        const existing = prev.find(u => u.uid === user.uid);
        if (!existing) {
          return [...prev, user];
        }
        return prev;
      });
    }
  };

  const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {
    setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
  };

  const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
    setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
  };

  const toggleAudio = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(!isAudioEnabled);
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerEnabled(!isSpeakerEnabled);
    // Note: Agora handles speaker/earpiece switching automatically
    // This is more for UI feedback
  };

  const cleanup = async () => {
    connectLockRef.current = false; // allow future calls
    try {
      console.log('Cleaning up audio call...');

      if (localAudioTrack) {
        localAudioTrack.close();
        setLocalAudioTrack(null);
      }

      if (client.connectionState === 'CONNECTED') {
        await client.leave();
        console.log('Left audio channel successfully');
      }

      // Remove event listeners
      client.removeAllListeners();

      setRemoteUsers([]);
      setIsJoined(false);
      setIsConnecting(false);
      setConnectionError(null);
    } catch (error) {
      console.error('Error during audio cleanup:', error);
    }
  };

  const endCall = async () => {
    await cleanup();
    onCallEnd();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isConnecting) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="animate-pulse mb-6">
            <div className="w-32 h-32 bg-white/20 rounded-full mx-auto flex items-center justify-center">
              <User className="w-16 h-16" />
            </div>
          </div>
          <p className="text-xl mb-2">Calling {recipientName || 'User'}...</p>
          <p className="text-blue-200">Connecting...</p>
          <p className="text-sm text-blue-300 mt-2">Channel: {channelName}</p>
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
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center z-50">
        <div className="text-center text-white max-w-lg mx-4">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <PhoneOff className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold mb-4">Call Failed</h2>
          <div className="bg-gray-900/80 rounded-lg p-4 mb-6 text-left">
            <pre className="text-blue-200 text-sm whitespace-pre-wrap font-mono leading-relaxed">
              {connectionError}
            </pre>
          </div>
          <button
            onClick={onCallEnd}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors mb-2"
          >
            Close
          </button>
          <p className="text-blue-300 text-xs">
            Check browser console (F12) for detailed technical logs
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 z-50 flex flex-col overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.4),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.3),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.3),transparent_70%)]"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div className="text-white">
              <h2 className="text-lg font-semibold">Audio Call</h2>
              <p className="text-sm text-white/70">
                {remoteUsers.length > 0 ? 'Connected' : 'Connecting...'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-white/70 text-sm">
              <span className="font-mono">
                {isJoined ? formatDuration(callDuration) : '00:00'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Call Info */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-white max-w-md">
          {/* User Avatar/Icon */}
          <div className="relative mb-8">
            <div className="w-48 h-48 bg-white/10 backdrop-blur-sm rounded-full mx-auto flex items-center justify-center border border-white/20 shadow-2xl">
              <User className="w-24 h-24 text-white/80" />
            </div>
            {/* Audio animation rings */}
            {remoteUsers.length > 0 && (
              <>
                <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping opacity-50"></div>
                <div className="absolute inset-0 rounded-full border-4 border-purple-400/30 animate-ping opacity-30" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-400/20 animate-ping opacity-20" style={{ animationDelay: '1s' }}></div>
              </>
            )}
          </div>

          {/* User Name */}
          <h2 className="text-3xl font-bold mb-3">
            {recipientName || `User ${remoteUsers[0]?.uid || 'Unknown'}`}
          </h2>

          {/* Call Status */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${remoteUsers.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-orange-500 animate-pulse'}`}></div>
            <p className="text-xl text-white/90 font-medium">
              {remoteUsers.length > 0 ? 'Connected' : 'Connecting...'}
            </p>
          </div>

          {/* Call Duration */}
          {isJoined && (
            <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 shadow-lg mb-6">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-3"></div>
              <p className="text-2xl font-mono text-white font-bold">
                {formatDuration(callDuration)}
              </p>
            </div>
          )}

          {/* Audio Status */}
          {remoteUsers.length > 0 && (
            <div className="flex justify-center items-center gap-6 mt-8">
              {remoteUsers.map((user) => (
                <div key={user.uid} className="flex items-center space-x-3 px-4 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  <div className={`w-3 h-3 rounded-full ${user.hasAudio ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium text-white/90">
                    {user.hasAudio ? 'Speaking' : 'Muted'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-10 p-8 bg-white/5 backdrop-blur-xl border-t border-white/10">
        <div className="flex justify-center items-center space-x-8">
          {/* Speaker Toggle */}
          <button
            onClick={toggleSpeaker}
            className={`relative group p-4 rounded-full transition-all duration-300 transform hover:scale-105 ${isSpeakerEnabled
                ? 'bg-white/20 hover:bg-white/30 text-white shadow-lg'
                : 'bg-gray-600/80 hover:bg-gray-700 text-white shadow-lg'
              }`}
            title={isSpeakerEnabled ? 'Switch to earpiece' : 'Switch to speaker'}
          >
            <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {isSpeakerEnabled ? (
              <Volume2 className="w-6 h-6 relative z-10" />
            ) : (
              <VolumeX className="w-6 h-6 relative z-10" />
            )}
          </button>

          {/* Mute Toggle */}
          <button
            onClick={toggleAudio}
            className={`relative group p-6 rounded-full transition-all duration-300 transform hover:scale-105 ${isAudioEnabled
                ? 'bg-white/20 hover:bg-white/30 text-white shadow-lg'
                : 'bg-red-500/90 hover:bg-red-600 text-white shadow-lg shadow-red-500/25'
              }`}
            title={isAudioEnabled ? 'Mute' : 'Unmute'}
          >
            <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {isAudioEnabled ? (
              <Mic className="w-8 h-8 relative z-10" />
            ) : (
              <MicOff className="w-8 h-8 relative z-10" />
            )}
          </button>

          {/* End Call */}
          <button
            onClick={endCall}
            className="relative group p-6 rounded-full bg-red-500/90 hover:bg-red-600 text-white shadow-lg shadow-red-500/25 transition-all duration-300 transform hover:scale-105"
            title="End call"
          >
            <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <PhoneOff className="w-8 h-8 relative z-10" />
          </button>
        </div>
      </div>
    </div>
  );
} 
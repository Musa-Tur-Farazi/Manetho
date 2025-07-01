"use client";

import { useState, useEffect } from 'react';
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
  const [client] = useState(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'opus' }));
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);

  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      setIsConnecting(true);
      setConnectionError(null);

      // Validate App ID format (should be 32 characters, alphanumeric)
      if (!appId || appId.length !== 32 || !/^[a-zA-Z0-9]+$/.test(appId)) {
        setConnectionError('Invalid Agora App ID format. App ID should be exactly 32 alphanumeric characters.');
        setIsConnecting(false);
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

        console.log('Joining audio channel:', channelName);
        await client.join(appId, channelName, token || null, userId);
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
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 to-purple-900 z-50 flex flex-col">
      {/* Call Info */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-white">
          {/* User Avatar/Icon */}
          <div className="w-40 h-40 bg-white/20 rounded-full mx-auto mb-8 flex items-center justify-center">
            <User className="w-20 h-20" />
          </div>

          {/* User Name */}
          <h2 className="text-2xl font-semibold mb-2">
            {recipientName || `User ${remoteUsers[0]?.uid || 'Unknown'}`}
          </h2>

          {/* Call Status */}
          <p className="text-blue-200 mb-2">
            {remoteUsers.length > 0 ? 'Connected' : 'Connecting...'}
          </p>

          {/* Call Duration */}
          {isJoined && (
            <p className="text-lg font-mono text-blue-100">
              {formatDuration(callDuration)}
            </p>
          )}

          {/* Audio Status */}
          <div className="flex justify-center items-center gap-4 mt-6">
            {remoteUsers.map((user) => (
              <div key={user.uid} className="text-sm text-blue-200">
                {user.hasAudio ? '🎤 Speaking' : '🔇 Muted'}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-8 flex justify-center items-center gap-6">
        {/* Speaker Toggle */}
        <button
          onClick={toggleSpeaker}
          className={`p-4 rounded-full transition-colors ${isSpeakerEnabled
            ? 'bg-white/20 hover:bg-white/30 text-white'
            : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          title={isSpeakerEnabled ? 'Switch to earpiece' : 'Switch to speaker'}
        >
          {isSpeakerEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>

        {/* Mute Toggle */}
        <button
          onClick={toggleAudio}
          className={`p-6 rounded-full transition-colors ${isAudioEnabled
            ? 'bg-white/20 hover:bg-white/30 text-white'
            : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          title={isAudioEnabled ? 'Mute' : 'Unmute'}
        >
          {isAudioEnabled ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
        </button>

        {/* End Call */}
        <button
          onClick={endCall}
          className="p-6 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
          title="End call"
        >
          <PhoneOff className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
} 
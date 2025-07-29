"use client";

import { useState, useEffect } from 'react';
import { Video, ExternalLink, Copy, CheckCircle, PhoneOff, Users, Clock } from 'lucide-react';

interface GoogleMeetCallProps {
  meetingUrl: string;
  fallbackUrl?: string;
  callerName: string;
  recipientName: string;
  onCallEnd: () => void;
  isInitiator?: boolean; // true if current user initiated the call
}

export default function GoogleMeetCall({
  meetingUrl,
  fallbackUrl,
  callerName,
  recipientName,
  onCallEnd,
  isInitiator = false
}: GoogleMeetCallProps) {
  const [copied, setCopied] = useState(false);
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Timer to track call duration
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleJoinMeeting = () => {
    console.log('🚀 Opening Google Meet:', meetingUrl);
    setMeetingStarted(true);

    // Open Google Meet in a new tab/window
    const meetWindow = window.open(meetingUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');

    // Focus on the new window if possible
    if (meetWindow) {
      meetWindow.focus();
    } else {
      // Fallback if popup is blocked
      window.location.href = meetingUrl;
    }
  };

  const handleTryFallback = () => {
    console.log('🔄 Trying fallback Google Meet URL:', fallbackUrl);
    if (fallbackUrl) {
      const meetWindow = window.open(fallbackUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
      if (meetWindow) {
        meetWindow.focus();
      } else {
        window.location.href = fallbackUrl;
      }
    }
  };

  const copyMeetingLink = () => {
    navigator.clipboard.writeText(meetingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 z-50 flex items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.3),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.3),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.3),transparent_70%)]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center text-white max-w-2xl mx-auto p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/20">
            <Video className="w-12 h-12 text-blue-400" />
          </div>

          <h2 className="text-3xl font-bold mb-4">
            {isInitiator ? 'Video Call Started' : 'Join Video Call'}
          </h2>

          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-lg">
                {isInitiator ? `${callerName} → ${recipientName}` : `${callerName} invited you`}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-white/70">
            <Clock className="w-4 h-4" />
            <span>Call duration: {formatTime(secondsElapsed)}</span>
          </div>
        </div>

        {/* Meeting Link Display */}
        <div className="bg-white/10 border border-white/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-white/80">Google Meet Link:</span>
            <button
              onClick={copyMeetingLink}
              className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
              title="Copy meeting link"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-black/30 rounded-lg p-3 font-mono text-sm break-all text-white/90 border border-white/10">
            {meetingUrl}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {!meetingStarted ? (
            <>
              <button
                onClick={handleJoinMeeting}
                className="w-full px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25 flex items-center justify-center gap-3"
              >
                <Video className="w-6 h-6" />
                {isInitiator ? 'Start Google Meet' : 'Join Google Meet'}
                <ExternalLink className="w-5 h-5" />
              </button>

              {fallbackUrl && (
                <button
                  onClick={handleTryFallback}
                  className="w-full px-6 py-3 bg-blue-500/80 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  Create New Meeting (Fallback)
                </button>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Meeting Opened</span>
                </div>
                <p className="text-white/80 text-sm">
                  Google Meet should have opened in a new tab. If it didn't, click the button below to try again.
                </p>
              </div>

              <button
                onClick={handleJoinMeeting}
                className="w-full px-6 py-3 bg-blue-500/80 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                Open Google Meet Again
              </button>
            </div>
          )}

          <button
            onClick={onCallEnd}
            className="w-full px-6 py-3 bg-red-500/90 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/25 flex items-center justify-center gap-2"
          >
            <PhoneOff className="w-5 h-5" />
            End Call
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-xs text-white/60 space-y-1">
          <p>• Make sure to allow microphone and camera permissions in Google Meet</p>
          <p>• Share this meeting link with the other participant if needed</p>
          <p>• The meeting will remain active until all participants leave</p>
        </div>
      </div>
    </div>
  );
} 
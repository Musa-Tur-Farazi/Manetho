"use client";

import { useState, useEffect } from 'react';
import { Phone, PhoneOff, Video, VideoOff } from 'lucide-react';

interface IncomingCallNotificationProps {
  callerName: string;
  callerAvatar?: string;
  isVideoCall: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onShow?: () => void;
}

export default function IncomingCallNotification({
  callerName,
  callerAvatar,
  isVideoCall,
  onAccept,
  onDecline,
  onShow
}: IncomingCallNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRinging, setIsRinging] = useState(false);

  console.log('🔔 IncomingCallNotification component mounted with props:', {
    callerName,
    callerAvatar,
    isVideoCall
  });

  useEffect(() => {
    console.log('🚀 IncomingCallNotification useEffect - showing notification');
    // Show notification with animation
    setIsVisible(true);
    setIsRinging(true);
    onShow?.();

    // Auto-decline after 30 seconds
    const autoDeclineTimer = setTimeout(() => {
      console.log('⏰ Auto-declining call after 30 seconds');
      handleDecline();
    }, 30000);

    return () => {
      clearTimeout(autoDeclineTimer);
      setIsRinging(false);
    };
  }, []);

  const handleAccept = () => {
    console.log('✅ Call accepted');
    setIsRinging(false);
    setIsVisible(false);
    onAccept();
  };

  const handleDecline = () => {
    console.log('❌ Call declined');
    setIsRinging(false);
    setIsVisible(false);
    onDecline();
  };

  if (!isVisible) {
    console.log('👻 Notification not visible, returning null');
    return null;
  }

  console.log('🎨 Rendering notification popup');

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />

      {/* Notification */}
      <div className="fixed inset-0 flex items-center justify-center z-[101] p-4">
        <div
          className={`bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl max-w-md w-full mx-auto transform transition-all duration-500 border border-white/20 dark:border-slate-700/30 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
        >
          {/* Caller Info */}
          <div className="text-center mb-8">
            <div className="relative mb-6">
              <div className={`w-32 h-32 mx-auto rounded-full overflow-hidden shadow-2xl ${isRinging ? 'animate-pulse' : ''}`}>
                <img
                  src={callerAvatar || '/api/placeholder/128/128'}
                  alt={callerName}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Ringing animation overlay */}
              {isRinging && (
                <>
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-ping opacity-75" />
                  <div className="absolute inset-0 rounded-full border-4 border-purple-500 animate-ping opacity-50" style={{ animationDelay: '0.5s' }} />
                </>
              )}
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {callerName}
            </h3>

            <div className="text-lg text-gray-600 dark:text-slate-300 flex items-center justify-center gap-3 mb-4">
              {isVideoCall ? (
                <>
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Video className="w-5 h-5 text-blue-500" />
                  </div>
                  <span>Incoming video call</span>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-500" />
                  </div>
                  <span>Incoming audio call</span>
                </>
              )}
            </div>

            {/* Call type indicator */}
            <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {isVideoCall ? 'Video' : 'Audio'} Call
              </span>
            </div>
          </div>

          {/* Call Actions */}
          <div className="flex justify-center items-center gap-8 mb-6">
            {/* Decline Button */}
            <button
              onClick={handleDecline}
              className="group relative flex items-center justify-center w-20 h-20 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 transform hover:scale-105"
              title="Decline call"
            >
              <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <PhoneOff className="w-8 h-8 relative z-10" />
            </button>

            {/* Accept Button */}
            <button
              onClick={handleAccept}
              className="group relative flex items-center justify-center w-20 h-20 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40 transform hover:scale-105"
              title="Accept call"
            >
              <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {isVideoCall ? (
                <Video className="w-8 h-8 relative z-10" />
              ) : (
                <Phone className="w-8 h-8 relative z-10" />
              )}
            </button>
          </div>

          {/* Auto-decline timer */}
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-slate-800/60 rounded-full">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse mr-2"></div>
              <p className="text-sm font-medium text-gray-600 dark:text-slate-400">
                Auto-decline in 30 seconds
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 
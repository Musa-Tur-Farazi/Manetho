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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" />

      {/* Notification */}
      <div className="fixed inset-0 flex items-center justify-center z-[101] p-4">
        <div
          className={`bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-auto transform transition-all duration-500 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
        >
          {/* Caller Info */}
          <div className="text-center mb-6">
            <div className="relative mb-4">
              <div className={`w-24 h-24 mx-auto rounded-full overflow-hidden ${isRinging ? 'animate-pulse' : ''}`}>
                <img
                  src={callerAvatar || '/api/placeholder/96/96'}
                  alt={callerName}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Ringing animation overlay */}
              {isRinging && (
                <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-ping opacity-75" />
              )}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {callerName}
            </h3>

            <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center justify-center gap-2">
              {isVideoCall ? (
                <>
                  <Video className="w-4 h-4" />
                  Incoming video call
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4" />
                  Incoming audio call
                </>
              )}
            </p>
          </div>

          {/* Call Actions */}
          <div className="flex justify-center gap-4">
            {/* Decline Button */}
            <button
              onClick={handleDecline}
              className="flex items-center justify-center w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              title="Decline call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>

            {/* Accept Button */}
            <button
              onClick={handleAccept}
              className="flex items-center justify-center w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              title="Accept call"
            >
              {isVideoCall ? (
                <Video className="w-6 h-6" />
              ) : (
                <Phone className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Auto-decline timer */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400 dark:text-slate-500">
              Auto-decline in 30 seconds
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 
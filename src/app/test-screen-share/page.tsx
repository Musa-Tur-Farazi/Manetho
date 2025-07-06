"use client";

import { useState } from 'react';
import { Monitor, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function TestScreenSharePage() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isSecure, setIsSecure] = useState<boolean | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);

  const checkSupport = () => {
    const supported = !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
    const secure = window.isSecureContext;

    setIsSupported(supported);
    setIsSecure(secure);
  };

  const testScreenShare = async () => {
    setIsTesting(true);
    setPermissionStatus('');

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      setPermissionStatus('✅ Success! Screen sharing permission granted.');

      // Stop the stream immediately since this is just a test
      stream.getTracks().forEach(track => track.stop());
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        setPermissionStatus('❌ Permission denied. User canceled or browser blocked screen sharing.');
      } else if (error.name === 'NotSupportedError') {
        setPermissionStatus('❌ Screen sharing not supported in this browser.');
      } else {
        setPermissionStatus(`❌ Error: ${error.message}`);
      }
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Monitor className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Screen Share Test
            </h1>
            <p className="text-gray-600 dark:text-slate-400">
              Test screen sharing permissions and browser compatibility
            </p>
          </div>

          <div className="space-y-6">
            {/* Check Support Button */}
            <div className="text-center">
              <button
                onClick={checkSupport}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Check Browser Support
              </button>
            </div>

            {/* Support Status */}
            {isSupported !== null && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-slate-800">
                  {isSupported ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Screen Sharing API Support
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      {isSupported
                        ? 'Your browser supports screen sharing'
                        : 'Screen sharing not supported in this browser'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-slate-800">
                  {isSecure ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Secure Context
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      {isSecure
                        ? 'Running in secure context (HTTPS or localhost)'
                        : 'Not in secure context - screen sharing may not work'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Test Permission Button */}
            {isSupported && isSecure && (
              <div className="text-center">
                <button
                  onClick={testScreenShare}
                  disabled={isTesting}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                >
                  {isTesting ? 'Testing...' : 'Test Screen Share Permission'}
                </button>
              </div>
            )}

            {/* Permission Status */}
            {permissionStatus && (
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Permission Test Result
                </h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 whitespace-pre-wrap">
                  {permissionStatus}
                </p>
              </div>
            )}

            {/* Instructions */}
            <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                Troubleshooting Tips
              </h3>
              <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-2">
                <li>• Ensure you're using Chrome, Firefox, or Edge (latest versions)</li>
                <li>• Make sure the site is running on HTTPS or localhost</li>
                <li>• Click "Share" when the browser prompts for screen sharing permission</li>
                <li>• If permission was denied, refresh the page and try again</li>
                <li>• Check that no other applications are using screen capture</li>
                <li>• The permission dialog might appear behind other windows</li>
              </ul>
            </div>

            {/* Browser Info */}
            <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                Current Environment
              </h3>
              <div className="text-sm text-gray-600 dark:text-slate-400 space-y-1">
                <p>Browser: {navigator.userAgent}</p>
                <p>Protocol: {window.location.protocol}</p>
                <p>Host: {window.location.host}</p>
                <p>Secure Context: {window.isSecureContext ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
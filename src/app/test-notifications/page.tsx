"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import NotificationBell from '@/components/NotificationBell';

export default function TestNotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const createTestNotifications = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/test-notifications', {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessage(`✅ Created ${data.notifications?.length || 0} test notifications`);
      } else {
        const error = await response.json();
        setMessage(`❌ Error: ${error.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const checkNotifications = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/test-notifications');
      
      if (response.ok) {
        const data = await response.json();
        setMessage(`📊 Found ${data.count || 0} notifications in database`);
      } else {
        const error = await response.json();
        setMessage(`❌ Error: ${error.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Notification Testing Page
          </h1>
          
          <div className="flex items-center gap-4 mb-6">
            <NotificationBell />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ← This is the NotificationBell component
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button
                onClick={createTestNotifications}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {loading ? 'Creating...' : 'Create Test Notifications'}
              </Button>
              
              <Button
                onClick={checkNotifications}
                disabled={loading}
                variant="outline"
              >
                {loading ? 'Checking...' : 'Check Notifications Count'}
              </Button>
            </div>
            
            {message && (
              <div className={`p-4 rounded-lg ${
                message.includes('✅') 
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                  : message.includes('❌') 
                    ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                    : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
              }`}>
                {message}
              </div>
            )}
          </div>
          
          <div className="mt-8 p-4 bg-gray-100 dark:bg-slate-700 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Instructions:
            </h2>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>Click "Create Test Notifications" to add sample notifications to your account</li>
              <li>Click the notification bell icon to see the notifications</li>
              <li>Navigate to different pages to test if notifications persist</li>
              <li>Use "Check Notifications Count" to verify notifications are in the database</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 
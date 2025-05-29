"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useUser } from "@clerk/nextjs";

interface DatabaseUser {
  id: number;
  clerkId: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  username: string;
}

interface ClerkUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
  username: string;
}

export default function SyncUsersPage() {
  const { user } = useUser();
  const [databaseUsers, setDatabaseUsers] = useState<DatabaseUser[]>([]);
  const [currentClerkUser, setCurrentClerkUser] = useState<ClerkUser | null>(null);
  const [userExistsInDb, setUserExistsInDb] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");

  const checkUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/check-users');
      const data = await response.json();

      if (data.success) {
        setDatabaseUsers(data.databaseUsers);
        setCurrentClerkUser(data.currentClerkUser);
        setUserExistsInDb(data.userExistsInDb);
        setMessage("");
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`Error checking users: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const syncCurrentUser = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/check-users', {
        method: 'POST'
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(`Success: ${data.message}`);
        // Refresh the user list
        await checkUsers();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`Error syncing user: ${error}`);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    checkUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            User Database Sync
          </h1>

          <div className="space-y-6">
            {/* Current Clerk User */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Current Clerk User
              </h2>
              {currentClerkUser ? (
                <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={currentClerkUser.imageUrl}
                      alt="User avatar"
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {currentClerkUser.firstName} {currentClerkUser.lastName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {currentClerkUser.email}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Clerk ID:</strong> {currentClerkUser.id}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Username:</strong> {currentClerkUser.username || 'N/A'}
                  </p>
                  <p className={`text-sm font-medium mt-2 ${userExistsInDb ? 'text-green-600' : 'text-red-600'}`}>
                    {userExistsInDb ? '✓ Exists in database' : '✗ Not in database'}
                  </p>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No user logged in</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={checkUsers}
                disabled={loading}
                variant="outline"
              >
                {loading ? 'Checking...' : 'Refresh Users'}
              </Button>

              {currentClerkUser && !userExistsInDb && (
                <Button
                  onClick={syncCurrentUser}
                  disabled={syncing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {syncing ? 'Syncing...' : 'Sync Current User'}
                </Button>
              )}
            </div>

            {/* Message */}
            {message && (
              <div className={`p-3 rounded ${message.includes('Error')
                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                }`}>
                {message}
              </div>
            )}

            {/* Database Users */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Database Users ({databaseUsers.length})
              </h2>
              {databaseUsers.length > 0 ? (
                <div className="space-y-3">
                  {databaseUsers.map((dbUser) => (
                    <div key={dbUser.id} className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={dbUser.imageUrl || 'https://i.pravatar.cc/150?img=1'}
                          alt="User avatar"
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {dbUser.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {dbUser.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            DB ID: {dbUser.id}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Clerk: {dbUser.clerkId}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No users in database</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
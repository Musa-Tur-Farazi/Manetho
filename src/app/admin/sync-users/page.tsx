"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Database, CheckCircle, AlertCircle, RefreshCw, Bug } from "lucide-react";

interface DatabaseUser {
  user_id: string;
  clerk_id: string;
  full_name: string;
  email: string;
  role: string;
  is_locked: boolean;
  joined_at: string;
  last_active_at: string;
}

interface SyncResult {
  success: boolean;
  message: string;
  userId?: string;
}

interface DebugInfo {
  syncResult?: {
    success: boolean;
    message: string;
    userId?: string;
  };
  databaseStatus?: {
    success: boolean;
    users: DatabaseUser[];
    totalUsers: number;
  };
  timestamp?: string;
  error?: string;
}

export default function SyncUsersPage() {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<DatabaseUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/check-users');
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        setTotalUsers(data.totalUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSyncUser = async () => {
    setIsLoading(true);
    setSyncResult(null);

    try {
      const response = await fetch('/api/auth/sync-user', {
        method: 'POST',
      });

      const data = await response.json();
      setSyncResult(data);

      // Refresh users list
      await fetchUsers();
    } catch (error) {
      setSyncResult({
        success: false,
        message: 'Failed to sync user: ' + (error as Error).message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualCreate = async () => {
    setIsLoading(true);
    setSyncResult(null);

    try {
      const response = await fetch('/api/check-users', {
        method: 'POST',
      });

      const data = await response.json();
      setSyncResult({
        success: !data.error,
        message: data.message || data.error,
        userId: data.user?.user_id
      });

      // Refresh users list
      await fetchUsers();
    } catch (error) {
      setSyncResult({
        success: false,
        message: 'Failed to create user: ' + (error as Error).message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDebugSync = async () => {
    setIsLoading(true);
    setDebugInfo(null);

    try {
      // Try force create using the auto-sync API
      const syncResponse = await fetch('/api/auto-sync', { method: 'POST' });
      const syncData = await syncResponse.json();

      // Get current user info for debug display
      const checkResponse = await fetch('/api/check-users');
      const checkData = await checkResponse.json();

      setDebugInfo({
        syncResult: syncData,
        databaseStatus: checkData,
        timestamp: new Date().toISOString()
      });

      // Refresh users list
      await fetchUsers();
    } catch (error) {
      setDebugInfo({
        error: 'Auto-sync failed: ' + (error as Error).message
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            User Sync Administration
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage user synchronization between Clerk and database
          </p>
        </div>

        {/* Current User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Current User Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <p><strong>Name:</strong> {user.fullName || 'No name'}</p>
                <p><strong>Email:</strong> {user.emailAddresses[0]?.emailAddress}</p>
                <p><strong>Clerk ID:</strong> {user.id}</p>
                <p><strong>Status:</strong> <Badge variant="default">Authenticated</Badge></p>
                {/* Check if user exists in database */}
                <p><strong>In Database:</strong>
                  <Badge variant={users.some(dbUser => dbUser.clerk_id === user.id) ? "default" : "destructive"}>
                    {users.some(dbUser => dbUser.clerk_id === user.id) ? "Yes" : "No"}
                  </Badge>
                </p>
              </div>
            ) : (
              <p className="text-red-600">Not authenticated</p>
            )}
          </CardContent>
        </Card>

        {/* Sync Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Sync Actions
            </CardTitle>
            <CardDescription>
              Manually sync your user to the database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={handleSyncUser}
                disabled={isLoading || !user}
                className="w-full"
                variant="outline"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Smart Sync User
              </Button>

              <Button
                onClick={handleManualCreate}
                disabled={isLoading || !user}
                className="w-full"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Force Create User
              </Button>

              <Button
                onClick={handleDebugSync}
                disabled={isLoading || !user}
                className="w-full"
                variant="destructive"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bug className="h-4 w-4 mr-2" />}
                Debug & Fix
              </Button>
            </div>

            {/* Sync Result */}
            {syncResult && (
              <div className={`p-4 rounded-lg ${syncResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2">
                  {syncResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={syncResult.success ? 'text-green-800' : 'text-red-800'}>
                    {syncResult.message}
                  </span>
                </div>
                {syncResult.userId && (
                  <p className="text-sm text-green-600 mt-1">User ID: {syncResult.userId}</p>
                )}
              </div>
            )}

            {/* Debug Info */}
            {debugInfo && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Debug Information:</h4>
                <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-60">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Database Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Users ({totalUsers})
            </CardTitle>
            <CardDescription>
              Users currently stored in the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length > 0 ? (
              <div className="space-y-3">
                {users.map((dbUser) => (
                  <div key={dbUser.user_id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{dbUser.full_name}</p>
                        <p className="text-sm text-gray-600">{dbUser.email}</p>
                        <p className="text-xs text-gray-500">Clerk ID: {dbUser.clerk_id}</p>
                        <p className="text-xs text-gray-500">DB ID: {dbUser.user_id}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={!dbUser.is_locked ? "default" : "destructive"}>
                          {dbUser.role}
                        </Badge>
                        {dbUser.is_locked && (
                          <Badge variant="destructive" className="ml-1">
                            Locked
                          </Badge>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Joined: {new Date(dbUser.joined_at).toLocaleDateString()}
                        </p>
                        {dbUser.last_active_at && (
                          <p className="text-xs text-gray-500">
                            Last Active: {new Date(dbUser.last_active_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No users found in database. Try syncing a user.
              </p>
            )}

            <Button
              onClick={fetchUsers}
              variant="outline"
              className="w-full mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Users
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
"use client";

import { useEffect, useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  const [syncStatus, setSyncStatus] = useState("Initializing...");

  useEffect(() => {
    const processCallback = async () => {
      try {
        setSyncStatus("Processing OAuth callback...");
        // Handle the OAuth callback first
        await handleRedirectCallback({
          afterSignInUrl: "/home",
          afterSignUpUrl: "/home",
        });
      } catch (error) {
        console.error("Error handling OAuth callback:", error);
        setSyncStatus("OAuth callback completed with warnings");
        // Still try to redirect even if there's an error
        setTimeout(() => router.push("/home"), 2000);
      }
    };

    processCallback();
  }, [handleRedirectCallback, router]);

  // Sync user with database after OAuth authentication
  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded && user && isProcessing) {
        try {
          console.log("Auto-syncing user to database:", user.id);
          setSyncStatus("Syncing user to database...");

          // Use the dedicated auto-sync API
          const response = await fetch('/api/auto-sync', {
            method: 'POST',
          });

          if (response.ok) {
            const data = await response.json();
            console.log("Auto-sync result:", data);

            if (data.existed) {
              setSyncStatus("Welcome back! User updated.");
            } else {
              setSyncStatus("Account created successfully!");
            }

            // Redirect after successful sync
            setTimeout(() => {
              router.push("/home");
            }, 1500);
          } else {
            console.warn("Failed to sync user with database");
            setSyncStatus("Sync failed, but continuing...");

            // Still redirect even if sync fails
            setTimeout(() => {
              router.push("/home");
            }, 2000);
          }
        } catch (error) {
          console.error("Error auto-syncing user:", error);
          setSyncStatus("Sync error, but continuing...");

          // Still redirect even if there's an error
          setTimeout(() => {
            router.push("/home");
          }, 2000);
        } finally {
          setIsProcessing(false);
        }
      }
    };

    syncUser();
  }, [isLoaded, user, isProcessing, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-cyan-600 dark:text-cyan-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Setting up your account...
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          {syncStatus}
        </p>
        {user && (
          <p className="text-sm text-gray-500 mt-2">
            Welcome, {user.fullName || user.firstName}!
          </p>
        )}
      </div>
    </div>
  );
} 
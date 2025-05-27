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

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Handle the OAuth callback first
        await handleRedirectCallback({
          afterSignInUrl: "/home",
          afterSignUpUrl: "/home",
        });
      } catch (error) {
        console.error("Error handling OAuth callback:", error);
        // Still try to redirect even if there's an error
        router.push("/home");
      }
    };

    processCallback();
  }, [handleRedirectCallback, router]);

  // Sync user with database after OAuth authentication
  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded && user && isProcessing) {
        try {
          console.log("Syncing OAuth user with database:", user.id);

          const response = await fetch('/api/auth/sync-user', {
            method: 'POST',
          });

          if (response.ok) {
            const data = await response.json();
            console.log("User sync result:", data.message);
          } else {
            console.warn("Failed to sync user with database");
          }
        } catch (error) {
          console.error("Error syncing OAuth user:", error);
        } finally {
          setIsProcessing(false);
          // Redirect to home after sync attempt
          setTimeout(() => {
            router.push("/home");
          }, 1000);
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
          {isProcessing ? "Setting up your account..." : "Completing authentication..."}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          {isProcessing
            ? "We're preparing your profile and syncing your data."
            : "Please wait while we redirect you."
          }
        </p>
      </div>
    </div>
  );
} 
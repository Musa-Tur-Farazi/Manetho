"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk();

  useEffect(() => {
    handleRedirectCallback({
      // Redirect to the home page after sign-in with OAuth
      // or to the URL specified in redirectUrlComplete
      afterSignInUrl: "/home",
      afterSignUpUrl: "/home",
    });
  }, [handleRedirectCallback]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950">
      <div id="clerk-captcha"></div>

      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-cyan-600 dark:text-cyan-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Completing authentication...
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Please wait while we redirect you.
        </p>
      </div>
    </div>
  );
} 
"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface AuthCheckProps {
  children: ReactNode;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
}

export default function AuthCheck({
  children,
  fallback,
  loadingComponent
}: AuthCheckProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      setIsChecking(false);
      if (!isSignedIn && !fallback) {
        // If no fallback is provided, redirect to sign-in
        router.push("/custom-auth/sign-in");
      }
    }
  }, [isLoaded, isSignedIn, router, fallback]);

  if (!isLoaded || isChecking) {
    // Show loading state while checking auth
    return (
      loadingComponent || (
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-600 dark:text-cyan-400" />
          <span className="ml-2 text-gray-700 dark:text-gray-300">Checking authentication...</span>
        </div>
      )
    );
  }

  // If signed in, show the protected content
  if (isSignedIn) {
    return <>{children}</>;
  }

  // If not signed in and fallback is provided, show the fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  // This should not be reached if there's a redirect in the useEffect
  return null;
} 
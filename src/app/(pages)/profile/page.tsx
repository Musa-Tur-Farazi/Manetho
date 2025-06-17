"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        router.push(`/profile/${user.id}`);
      } else {
        router.push("/sign-in");
      }
    }
  }, [isLoaded, user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Loading...</h1>
        <p className="text-gray-600 dark:text-gray-400">Redirecting to your profile...</p>
      </div>
    </div>
  );
} 
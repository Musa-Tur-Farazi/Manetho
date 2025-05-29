"use client";

import { X, UserRound, ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";
import { useRouter } from "next/navigation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectPath?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  redirectPath = "/"
}: AuthModalProps) {
  const router = useRouter();

  const handleSignIn = () => {
    onClose();
    // Always redirect to home after sign-in
    router.push(`/custom-auth/sign-in?redirect_url=${encodeURIComponent("/home")}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sign in required
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center p-10 bg-gradient-to-br from-cyan-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 rounded-lg mb-6">
            <UserRound className="h-16 w-16 text-cyan-600 dark:text-cyan-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-center">
            Please sign in to access this page and all our learning features.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            className="w-full justify-center py-6"
            onClick={handleSignIn}
          >
            Sign In
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <div className="text-center mt-6">
            <button
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Return to landing page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
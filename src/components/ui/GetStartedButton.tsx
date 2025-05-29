"use client";

import { Button } from "./Button";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

type GetStartedButtonProps = {
  className?: string;
};

export default function GetStartedButton({ className = "" }: GetStartedButtonProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/custom-auth/sign-up?redirect_url=%2Fhome');
  };

  return !isSignedIn ? (
    <Button
      size="lg"
      className={`bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-600 dark:to-blue-700 hover:from-cyan-700 hover:to-blue-700 dark:hover:from-cyan-700 dark:hover:to-blue-800 text-white px-8 py-6 text-lg ${className}`}
      onClick={handleGetStarted}
    >
      Get Started
      <ArrowRight className="ml-2 h-5 w-5" />
    </Button>
  ) : (
    <Button
      size="lg"
      className={`bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-600 dark:to-blue-700 hover:from-cyan-700 hover:to-blue-700 dark:hover:from-cyan-700 dark:hover:to-blue-800 text-white px-8 py-6 text-lg ${className}`}
      href="/home"
    >
      Go to Dashboard
      <ArrowRight className="ml-2 h-5 w-5" />
    </Button>
  );
}

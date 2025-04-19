"use client";

import { Button } from "./Button";
import { SignUpButton, useAuth } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";

type GetStartedButtonProps = {
  className?: string;
};

export default function GetStartedButton({ className = "" }: GetStartedButtonProps) {
  const { isSignedIn } = useAuth();

  return !isSignedIn ? (
    <SignUpButton>
      <Button
        size="lg"
        className={`bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-600 dark:to-blue-700 hover:from-cyan-700 hover:to-blue-700 dark:hover:from-cyan-700 dark:hover:to-blue-800 text-white px-8 py-6 text-lg ${className}`}
      >
        Get Started
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </SignUpButton>
  ) : (
    <Button
      size="lg"
      className={`bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-600 dark:to-blue-700 hover:from-cyan-700 hover:to-blue-700 dark:hover:from-cyan-700 dark:hover:to-blue-800 text-white px-8 py-6 text-lg ${className}`}
      href="/dashboard"
    >
      Go to Dashboard
      <ArrowRight className="ml-2 h-5 w-5" />
    </Button>
  );
}

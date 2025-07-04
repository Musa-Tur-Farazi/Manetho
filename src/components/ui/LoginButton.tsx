"use client";

import { Button } from "./Button";
import { UserButton, useAuth } from "@clerk/nextjs";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

type LoginButtonProps = {
  className?: string;
};

export default function LoginButton({ className = "" }: LoginButtonProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleLoginClick = () => {
    router.push("/custom-auth/sign-in");
  };

  return isSignedIn ? (
    <UserButton
      afterSignOutUrl="/"
      appearance={{
        elements: {
          userButtonAvatarBox: "w-9 h-9",
          userButtonBox: className,
        },
      }}
    />
  ) : (
    <Button
      className={`bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-800 ${className}`}
      onClick={handleLoginClick}
    >
      Login
    </Button>
  );
}

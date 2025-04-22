"use client";

import { ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";

interface AuthProtectedLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function AuthProtectedLink({
  href,
  children,
  className = "",
  onClick
}: AuthProtectedLinkProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isLoaded) return; // Wait for auth to load

    if (isSignedIn) {
      // If authenticated, navigate to the link
      router.push(href);
      if (onClick) onClick();
    } else {
      // If not authenticated, redirect to our custom sign-in page with redirect to home
      router.push(`/custom-auth/sign-in?redirect_url=${encodeURIComponent("/home")}`);
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
} 
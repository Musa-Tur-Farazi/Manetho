"use client";

import { useState, ReactNode } from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import AuthModal from "../auth/AuthModal";

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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isLoaded) return; // Wait for auth to load

    if (isSignedIn) {
      // If authenticated, navigate to the link
      router.push(href);
      if (onClick) onClick();
    } else {
      // If not authenticated, show auth modal
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <a
        href={href}
        onClick={handleClick}
        className={className}
      >
        {children}
      </a>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectPath={href}
      />
    </>
  );
} 
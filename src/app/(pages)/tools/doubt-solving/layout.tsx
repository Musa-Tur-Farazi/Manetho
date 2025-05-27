"use client";

import AuthCheck from "../../../../../components/auth/AuthCheck";

/**
 * ChatGPT-style layout with always-visible navbar
 */
export default function DoubtSolvingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthCheck>
      <div className="absolute inset-0 h-screen w-screen bg-[#343541] overflow-hidden">
        {children}
      </div>
    </AuthCheck>
  );
} 
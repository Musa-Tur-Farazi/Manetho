"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/landingpage/layout/Navbar";
import Footer from "@/components/landingpage/section/Footer";
import AuthCheck from "@/components/auth/AuthCheck";
import { usePathname } from "next/navigation";

export default function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Check if the current path is the doubt-solving page
  const isDoubtSolvingPage = pathname?.includes('/tools/doubt-solving');

  // Check if the current path is the community page
  const isCommunityPage = pathname?.includes('/community');

  // Check if the current path is a profile page
  const isProfilePage = pathname?.includes('/profile/');

  // Check if the current path is the main chat page (not group study chat)
  const isChatPage = pathname === '/chat';

  // Check if the current path is a group study chat page
  const isGroupStudyChatPage = pathname?.includes('/group-study/chat/');

  // Check if the current path is the flashcards page
  const isFlashcardsPage = pathname?.includes('/tools/flashcards');

  // Check if the current path is the mind maps page
  const isMindMapsPage = pathname?.includes('/tools/mind-maps');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    handleResize(); // Set initial value

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // For the doubt-solving page, just render the children without the layout
  if (isDoubtSolvingPage) {
    return <AuthCheck>{children}</AuthCheck>;
  }

  // For the community page, profile pages, and chat pages, render without navbar and footer
  if (isCommunityPage || isProfilePage || isChatPage || isGroupStudyChatPage) {
    return (
      <AuthCheck>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 transition-colors duration-300">
          <main className="relative">
            <div className="w-full h-screen">
              {children}
            </div>
          </main>
        </div>
      </AuthCheck>
    );
  }

  // For other pages, use the normal layout
  return (
    <AuthCheck>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 transition-colors duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#2a2a3a_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        <Navbar isScrolled={isScrolled} />
        <main className="relative pt-24 pb-16">
          {isCommunityPage || isFlashcardsPage ? (
            // Full width for community and flashcards pages
            <div className="w-full min-h-[calc(100vh-300px)]">
              {children}
            </div>
          ) : (
            // Constrained width for other pages
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-300px)]">
              {children}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </AuthCheck>
  );
} 
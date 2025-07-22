"use client";

import { Button } from "../../ui/Button";
import { Menu, X, ArrowRight, Moon, Sun, Plus } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { useAuth } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import AuthProtectedLink from "../AuthProtectedLink";
import ThemeToggle from "../../theme/ThemeToggle";

interface NavbarProps {
  isScrolled?: boolean;
}

export default function Navbar({ isScrolled = false }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = useTheme();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Check if we're on the community page, flashcards page, or mind maps page
  const isCommunityPage = pathname?.includes('/community');
  const isFlashcardsPage = pathname?.includes('/flashcards');
  const isMindMapsPage = pathname?.includes('/mind-maps');

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleProfile = () => {
    router.push('/profile');
  };

  const handleLogin = () => {
    router.push('/custom-auth/sign-in?redirect_url=%2Fhome');
  };

  return (
    <nav
      className={`w-full fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isCommunityPage || isFlashcardsPage || isMindMapsPage
        ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200/30 dark:border-slate-700/30 shadow-lg py-2"
        : isScrolled
          ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg shadow-md py-4 px-6 md:px-10"
          : "bg-white/10 dark:bg-slate-900/10 backdrop-blur-lg border-b border-white/20 dark:border-gray-800/20 py-4 px-6 md:px-10"
        }`}
    >
      <div className={`${isCommunityPage || isFlashcardsPage || isMindMapsPage ? 'w-full px-4 sm:px-6 lg:px-8' : 'max-w-7xl mx-auto'} flex items-center justify-between`}>
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center">
                        <h1 className={`text-2xl font-bold transition-all duration-300 ${isCommunityPage || isFlashcardsPage || isMindMapsPage
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent hover:from-indigo-400 hover:to-purple-400"
                : "text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              }`}>
              Manetho
            </h1>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <div className="relative group">
              <button className="py-2 px-3 text-gray-700 dark:text-gray-300 font-medium group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                Study Tools
                <span className="ml-1">▼</span>
              </button>
              <div className="absolute left-0 top-full mt-1 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <AuthProtectedLink
                  href="/tools/flashcards"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md"
                >
                  Flashcards
                </AuthProtectedLink>
                <AuthProtectedLink
                  href="/tools/mind-maps"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md"
                >
                  Mind Maps
                </AuthProtectedLink>
                <AuthProtectedLink
                  href="/tools/doubt-solving"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md"
                >
                  AI Doubt Solver
                </AuthProtectedLink>
                <AuthProtectedLink
                  href="/group-study"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md"
                >
                  Group Study
                </AuthProtectedLink>
                <AuthProtectedLink
                  href="/progress"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md"
                >
                  My Progress
                </AuthProtectedLink>
              </div>
            </div>

            <Link
              href="/community"
              className="py-2 px-3 text-gray-700 dark:text-gray-300 font-medium hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
            >
              Community
            </Link>

            <Link
              href="/chat"
              className="py-2 px-3 text-gray-700 dark:text-gray-300 font-medium hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
            >
              Study Chat
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex items-center gap-3">
            {isFlashcardsPage && isSignedIn && (
              <Button
                onClick={() => router.push('/tools/flashcards?create=true')}
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-md hover:shadow-lg transition-all duration-300 px-4 py-2 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Flashcard
              </Button>
            )}
            {isSignedIn ? (
              <Button
                onClick={handleProfile}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
              >
                My Profile
              </Button>
            ) : (
              <Button
                variant="outline"
                className="bg-gradient-to-r from-white to-indigo-50 dark:from-indigo-900/30 dark:to-purple-900/40 border border-indigo-200 dark:border-indigo-500/40 text-indigo-600 dark:text-indigo-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100 dark:hover:from-indigo-800/40 dark:hover:to-purple-700/50 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 px-5 py-2.5"
                onClick={handleLogin}
              >
                Log in
              </Button>
            )}
            <ThemeToggle />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 pt-20 px-6">
          <div className="flex flex-col space-y-4">
            <Link
              href="/"
              className="py-3 px-4 border-b border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>

            <div>
              <div className="py-3 px-4 border-b border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 font-medium">
                Study Tools
              </div>
              <div className="ml-4">
                <AuthProtectedLink
                  href="/tools/flashcards"
                  className="block py-2 text-gray-600 dark:text-gray-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Flashcards
                </AuthProtectedLink>
                <AuthProtectedLink
                  href="/tools/doubt-solving"
                  className="block py-2 text-gray-600 dark:text-gray-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  AI Doubt Solver
                </AuthProtectedLink>
                <AuthProtectedLink
                  href="/group-study"
                  className="block py-2 text-gray-600 dark:text-gray-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Group Study
                </AuthProtectedLink>
                <AuthProtectedLink
                  href="/progress"
                  className="block py-2 text-gray-600 dark:text-gray-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Progress
                </AuthProtectedLink>
              </div>
            </div>

            <Link
              href="/community"
              className="py-3 px-4 border-b border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Community
            </Link>

            <Link
              href="/chat"
              className="py-3 px-4 border-b border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Study Chat
            </Link>

            <div className="pt-4 flex flex-col gap-3">
              {isFlashcardsPage && isSignedIn && (
                <Button
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push('/tools/flashcards?create=true');
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Create Flashcard
                </Button>
              )}
              {isSignedIn ? (
                <Button
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleProfile();
                  }}
                >
                  My Profile
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full bg-gradient-to-r from-white to-indigo-50 dark:from-indigo-900/30 dark:to-purple-900/40 border border-indigo-200 dark:border-indigo-500/40 text-indigo-600 dark:text-indigo-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100 dark:hover:from-indigo-800/40 dark:hover:to-purple-700/50 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogin();
                  }}
                >
                  Log in
                </Button>
              )}

              <div className="flex justify-center mt-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

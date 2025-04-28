"use client";

import { Button } from "../../ui/Button";
import { Menu, X, ArrowRight, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
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

  const handleDashboard = () => {
    router.push('/home');
  };

  const handleLogin = () => {
    router.push('/custom-auth/sign-in?redirect_url=%2Fhome');
  };

  return (
    <nav
      className={`w-full py-4 px-6 md:px-10 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg shadow-md"
        : "bg-white/10 dark:bg-slate-900/10 backdrop-blur-lg border-b border-white/20 dark:border-gray-800/20"
        }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent">
              Manetho
            </h1>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <div className="relative group">
              <button className="py-2 px-3 text-gray-700 dark:text-gray-300 font-medium group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                Explore
                <span className="ml-1">▼</span>
              </button>
              <div className="absolute left-0 top-full mt-1 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <AuthProtectedLink
                  href="/ai-solver"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md"
                >
                  AI-doubt solver
                </AuthProtectedLink>
                <AuthProtectedLink
                  href="/flashcards"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md"
                >
                  FlashCards
                </AuthProtectedLink>
                <AuthProtectedLink
                  href="/mind-maps"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md"
                >
                  Mind Maps
                </AuthProtectedLink>
                <AuthProtectedLink
                  href="/progress"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md"
                >
                  Progress Tracking
                </AuthProtectedLink>
                <AuthProtectedLink
                  href="/group-study"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md"
                >
                  Group Study
                </AuthProtectedLink>
              </div>
            </div>

            <Link
              href="/community"
              className="py-2 px-3 text-gray-700 dark:text-gray-300 font-medium hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
            >
              Join our community
            </Link>

            <Link
              href="/faq"
              className="py-2 px-3 text-gray-700 dark:text-gray-300 font-medium hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
            >
              FAQ
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex items-center gap-3">
            {isSignedIn ? (
              <Button
                onClick={handleDashboard}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
              >
                Dashboard
              </Button>
            ) : (
              <Button
                variant="outline"
                className="bg-gradient-to-r from-white to-purple-50 dark:from-purple-900/30 dark:to-indigo-900/40 border border-purple-200 dark:border-purple-500/40 text-purple-600 dark:text-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 dark:hover:from-purple-800/40 dark:hover:to-indigo-700/50 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 px-5 py-2.5"
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
                Explore
              </div>
              <div className="ml-4">
                <AuthProtectedLink
                  href="/ai-solver"
                  className="block py-2 text-gray-600 dark:text-gray-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  AI-doubt solver
                </AuthProtectedLink>
                <AuthProtectedLink
                  href="/flashcards"
                  className="block py-2 text-gray-600 dark:text-gray-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FlashCards
                </AuthProtectedLink>
                <AuthProtectedLink
                  href="/mind-maps"
                  className="block py-2 text-gray-600 dark:text-gray-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mind Maps
                </AuthProtectedLink>
                <AuthProtectedLink
                  href="/progress"
                  className="block py-2 text-gray-600 dark:text-gray-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Progress Tracking
                </AuthProtectedLink>
                <AuthProtectedLink
                  href="/group-study"
                  className="block py-2 text-gray-600 dark:text-gray-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Group Study
                </AuthProtectedLink>
              </div>
            </div>

            <Link
              href="/community"
              className="py-3 px-4 border-b border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Join our community
            </Link>

            <Link
              href="/faq"
              className="py-3 px-4 border-b border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQ
            </Link>

            <div className="pt-4 flex flex-col gap-3">
              {isSignedIn ? (
                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleDashboard();
                  }}
                >
                  Dashboard
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full bg-gradient-to-r from-white to-purple-50 dark:from-purple-900/30 dark:to-indigo-900/40 border border-purple-200 dark:border-purple-500/40 text-purple-600 dark:text-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 dark:hover:from-purple-800/40 dark:hover:to-indigo-700/50 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300"
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

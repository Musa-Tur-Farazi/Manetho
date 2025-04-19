"use client";

import { Button } from "../../ui/Button";
import { Search, Menu, X } from "lucide-react";
import Link from "next/link";
import LoginButton from "../../ui/LoginButton";
import { useState, useEffect } from "react";
import { useTheme } from "../../theme/ThemeProvider";

interface NavbarProps {
  isScrolled?: boolean;
}

export default function Navbar({ isScrolled = false }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = useTheme();

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
            <h1 className="text-2xl font-bold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300">
              Manetho
            </h1>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <div className="relative group">
              <button className="py-2 px-3 text-gray-700 dark:text-gray-300 font-medium group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                Study Tools
                <span className="ml-1">▼</span>
              </button>
              <div className="absolute left-0 top-full mt-1 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link href="/tools/doubt-solving" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md">
                  AI Doubt Solving
                </Link>
                <Link href="/tools/flashcards" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md">
                  Flashcards
                </Link>
                <Link href="/tools/study-materials" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md">
                  Study Materials
                </Link>
                <Link href="/tools/group-study" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md">
                  Group Study
                </Link>
              </div>
            </div>

            <div className="relative group">
              <button className="py-2 px-3 text-gray-700 dark:text-gray-300 font-medium group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                Subjects
                <span className="ml-1">▼</span>
              </button>
              <div className="absolute left-0 top-full mt-1 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link href="/subjects/mathematics" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md">
                  Mathematics
                </Link>
                <Link href="/subjects/physics" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md">
                  Physics
                </Link>
                <Link href="/subjects/chemistry" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md">
                  Chemistry
                </Link>
                <Link href="/subjects/biology" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md">
                  Biology
                </Link>
              </div>
            </div>

            <Link href="/pricing" className="py-2 px-3 text-gray-700 dark:text-gray-300 font-medium hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
              Pricing
            </Link>

            <Link href="/blog" className="py-2 px-3 text-gray-700 dark:text-gray-300 font-medium hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
              Blog
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="search"
              className="pl-10 pr-4 py-2 bg-gray-100/80 dark:bg-slate-800/80 rounded-full w-[300px] focus:outline-none focus:ring-2 focus:ring-cyan-600 text-sm dark:text-gray-300 dark:placeholder-gray-500"
              placeholder="Search for study materials, resources..."
            />
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Button variant="outline" className="hidden md:inline-flex dark:border-gray-700 dark:text-gray-300 dark:hover:bg-slate-800">
              Create
            </Button>
            <LoginButton />
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
                <Link
                  href="/tools/doubt-solving"
                  className="block py-2 text-gray-600 dark:text-gray-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  AI Doubt Solving
                </Link>
                <Link
                  href="/tools/flashcards"
                  className="block py-2 text-gray-600 dark:text-gray-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Flashcards
                </Link>
                <Link
                  href="/tools/study-materials"
                  className="block py-2 text-gray-600 dark:text-gray-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Study Materials
                </Link>
                <Link
                  href="/tools/group-study"
                  className="block py-2 text-gray-600 dark:text-gray-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Group Study
                </Link>
              </div>
            </div>

            <div>
              <div className="py-3 px-4 border-b border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 font-medium">
                Subjects
              </div>
              <div className="ml-4">
                <Link
                  href="/subjects/mathematics"
                  className="block py-2 text-gray-600 dark:text-gray-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mathematics
                </Link>
                <Link
                  href="/subjects/physics"
                  className="block py-2 text-gray-600 dark:text-gray-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Physics
                </Link>
                <Link
                  href="/subjects/chemistry"
                  className="block py-2 text-gray-600 dark:text-gray-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Chemistry
                </Link>
                <Link
                  href="/subjects/biology"
                  className="block py-2 text-gray-600 dark:text-gray-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Biology
                </Link>
              </div>
            </div>

            <Link
              href="/pricing"
              className="py-3 px-4 border-b border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>

            <Link
              href="/blog"
              className="py-3 px-4 border-b border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog
            </Link>

            <div className="pt-4 flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full dark:border-gray-700 dark:text-gray-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Create
              </Button>
              <div onClick={() => setMobileMenuOpen(false)}>
                <LoginButton className="w-full" />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

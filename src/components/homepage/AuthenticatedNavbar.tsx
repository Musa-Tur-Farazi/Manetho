"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun, User, LogOut, ChevronDown, LayoutDashboard, Menu, X, BookOpen, BookMarked, Network, FileText, Brain } from "lucide-react";
import { useTheme } from "../theme/ThemeProvider";
import { Button } from "../ui/Button";

interface AuthenticatedNavbarProps {
  isScrolled: boolean;
  onDashboardClick?: () => void;
}

const AuthenticatedNavbar = ({ isScrolled, onDashboardClick }: AuthenticatedNavbarProps) => {
  const router = useRouter();
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [router]);

  // Scroll to section
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
<<<<<<< HEAD
=======
      
>>>>>>> bb7e448 (Initial commit with CI/CD setup)
      const offset = 80; // Account for fixed navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 px-4 lg:px-8 transition-all duration-300 ${isScrolled
        ? "py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md"
        : "py-4 bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/home" className="flex items-center">
          <span
            className={`text-2xl font-bold ${isScrolled
              ? "text-gray-900 dark:text-white"
              : "text-gray-900 dark:text-white"
              }`}
          >
            Manetho
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          <button
            onClick={() => scrollToSection('learning-section')}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${isScrolled
              ? "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              : "text-gray-800 hover:bg-white/20 dark:text-white dark:hover:bg-gray-800/20"
              } transition-colors duration-200`}
          >
            My Learning
          </button>
          <button
            onClick={() => scrollToSection('resources-section')}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${isScrolled
              ? "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              : "text-gray-800 hover:bg-white/20 dark:text-white dark:hover:bg-gray-800/20"
              } transition-colors duration-200`}
          >
            Resources
          </button>
          <button
            onClick={() => scrollToSection('tools-section')}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${isScrolled
              ? "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              : "text-gray-800 hover:bg-white/20 dark:text-white dark:hover:bg-gray-800/20"
              } transition-colors duration-200`}
          >
            Tools
          </button>
          <Link
            href="/tools/doubt-solving"
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center ${isScrolled
              ? "text-cyan-600 hover:bg-gray-100 dark:text-cyan-400 dark:hover:bg-gray-800"
              : "text-cyan-600 hover:bg-white/20 dark:text-cyan-400 dark:hover:bg-gray-800/20"
              } transition-colors duration-200`}
          >
            <Brain className="w-4 h-4 mr-1.5" />
            Doubt-Solving
          </Link>
        </div>

        {/* Right-side buttons */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`p-2 rounded-lg ${isScrolled
              ? "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              : "text-gray-800 hover:bg-white/20 dark:text-white dark:hover:bg-gray-800/20"
              }`}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isScrolled
                ? "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                : "text-gray-800 hover:bg-white/20 dark:text-white dark:hover:bg-gray-800/20"
                }`}
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user?.firstName || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                )}
              </div>
              <span className="hidden md:block">{user?.firstName || "Account"}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* User dropdown */}
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 overflow-hidden z-50"
                >
                  <div className="py-1">
                    <Link
                      href={user?.id ? `/profile/${user.id}` : '/profile'}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Your Profile
                      </div>
                    </Link>
                    <Link
                      href="/subjects"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        My Subjects
                      </div>
                    </Link>
                    <Link
                      href="/saved"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center gap-2">
                        <BookMarked className="w-4 h-4" />
                        Saved Resources
                      </div>
                    </Link>
                    <div className="border-t border-gray-200 dark:border-gray-700"></div>
                    <SignOutButton>
                      <button className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <div className="flex items-center gap-2">
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </div>
                      </button>
                    </SignOutButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg ${isScrolled
              ? "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              : "text-gray-800 hover:bg-white/20 dark:text-white dark:hover:bg-gray-800/20"
              }`}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white dark:bg-gray-900 mt-2 rounded-lg shadow-lg overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => scrollToSection('learning-section')}
                className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                My Learning
              </button>
              <button
                onClick={() => scrollToSection('resources-section')}
                className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Resources
              </button>
              <button
                onClick={() => scrollToSection('tools-section')}
                className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Tools
              </button>
              <Link
                href="/tools/doubt-solving"
                className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-cyan-600 dark:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-800"
<<<<<<< HEAD
=======
                onClick={() => setMobileMenuOpen(false)}
>>>>>>> bb7e448 (Initial commit with CI/CD setup)
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Doubt-Solving
                </div>
              </Link>
              <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
              <Link
                href={user?.id ? `/profile/${user.id}` : '/profile'}
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </div>
              </Link>
              <Link
                href="/settings"
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  Settings
                </div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default AuthenticatedNavbar; 
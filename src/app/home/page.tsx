"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Menu,
  X,
  Home,
  Settings,
  HelpCircle,
  User,
  Users,
  Brain,
  MessageSquare,
  BookMarked,
  FileText,
  BarChart3,
  Network,
  Trophy,
  Calculator,
  DollarSign,
  PenTool,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/theme/ThemeProvider";
import AuthenticatedNavbar from "@/components/homepage/AuthenticatedNavbar";
import Footer from "@/components/landingpage/section/Footer";
import AiDoubtSolver from "@/components/homepage/AiDoubtSolver";

const HomePage = () => {
  const { user, isLoaded } = useUser();
  const { theme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const firstName = user?.firstName || user?.username?.split(' ')[0] || "there";
  const [syncChecked, setSyncChecked] = useState(false);

  // Hide sidebar on mobile by default
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-sync user on page load
  useEffect(() => {
    const ensureUserSynced = async () => {
      if (isLoaded && user && !syncChecked) {
        try {
          console.log("Checking if user needs sync...");

          // Try auto-sync (it will check if user exists and create if needed)
          const syncResponse = await fetch('/api/auto-sync', { method: 'POST' });
          const syncData = await syncResponse.json();

          if (syncData.success) {
            if (syncData.existed) {
              console.log("User already exists in database");
            } else {
              console.log("User synced to database:", syncData.user);
            }
          } else {
            console.warn("Auto-sync failed:", syncData.error);
          }
        } catch (error) {
          console.error("Auto-sync error:", error);
        } finally {
          setSyncChecked(true);
        }
      }
    };

    ensureUserSynced();
  }, [isLoaded, user, syncChecked]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 transition-colors duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#2a2a3a_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <AuthenticatedNavbar
        isScrolled={isScrolled}
        onDashboardClick={() => { }}
      />

      {/* AI Doubt Solver */}
      <AiDoubtSolver expanded={false} />

      {/* Sidebar toggle button for mobile */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed left-0 top-20 z-40 p-2 m-4 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md text-gray-700 dark:text-gray-300"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed left-0 top-0 pt-20 pb-4 h-full w-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg z-30 overflow-y-auto scrollbar-thin"
          >
            <div className="p-4">
              {/* Main Navigation */}
              <div className="mb-8">
                <nav className="space-y-1.5">
                  <Link
                    href="/home"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700/60"
                  >
                    <Home className="w-5 h-5 mr-3 text-cyan-600 dark:text-cyan-400" />
                    Home
                  </Link>
                  <Link
                    href="/community"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                  >
                    <Users className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                    Community
                  </Link>
                  <Link
                    href="/tools/doubt-solving"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                  >
                    <Brain className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                    AI Doubt Solver
                  </Link>
                </nav>
              </div>

              {/* Study Tools Section */}
              <div className="mb-8">
                <h3 className="text-gray-400 dark:text-gray-500 text-xs uppercase font-semibold tracking-wider mb-4 px-2">
                  Study Tools
                </h3>
                <nav className="space-y-1.5">
                  <Link
                    href="/tools/flashcards"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                  >
                    <BookMarked className="w-5 h-5 mr-3 text-emerald-600 dark:text-emerald-400" />
                    Flashcards
                  </Link>
                  <Link
                    href="/mind-map"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                  >
                    <Network className="w-5 h-5 mr-3 text-purple-600 dark:text-purple-400" />
                    Mind Maps
                  </Link>
                  <Link
                    href="/group-study"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                  >
                    <Users className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />
                    Group Study
                  </Link>
                </nav>
              </div>

              {/* Subjects Section */}
              <div className="mb-8">
                <h3 className="text-gray-400 dark:text-gray-500 text-xs uppercase font-semibold tracking-wider mb-4 px-2">
                  Subjects
                </h3>
                <nav className="space-y-1.5">
                  <Link
                    href="/subjects/mathematics"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                  >
                    <Calculator className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />
                    Mathematics
                  </Link>
                </nav>
              </div>

              {/* Other Pages Section */}
              <div className="mb-8">
                <h3 className="text-gray-400 dark:text-gray-500 text-xs uppercase font-semibold tracking-wider mb-4 px-2">
                  More
                </h3>
                <nav className="space-y-1.5">
                  <Link
                    href={user?.id ? `/profile/${user.id}` : '/profile'}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                  >
                    <User className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                    Profile
                  </Link>
                  <Link
                    href="/chat"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                  >
                    <MessageCircle className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />
                    Messages
                  </Link>
                  <Link
                    href="/pricing"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                  >
                    <DollarSign className="w-5 h-5 mr-3 text-green-600 dark:text-green-400" />
                    Pricing
                  </Link>
                  <Link
                    href="/blog"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                  >
                    <PenTool className="w-5 h-5 mr-3 text-orange-600 dark:text-orange-400" />
                    Blog
                  </Link>
                </nav>
              </div>

              {/* Account Settings */}
              <div className="mb-8">
                <h3 className="text-gray-400 dark:text-gray-500 text-xs uppercase font-semibold tracking-wider mb-4 px-2">
                  Account
                </h3>
                <nav className="space-y-1.5">
                  <Link
                    href="/settings"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                  >
                    <Settings className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                    Settings
                  </Link>
                  <Link
                    href="/help"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                  >
                    <HelpCircle className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                    Help & Support
                  </Link>
                </nav>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className={`relative pt-24 pb-16 transition-all duration-300 ${sidebarOpen ? "md:ml-64" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <section className="mb-12">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome back, {firstName}!
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
                Your learning journey starts here.
              </p>
            </div>

            {/* Main Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {/* AI Doubt Solver Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 p-8 text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  AI Doubt Solver
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Get instant help with your academic questions using our advanced AI assistant.
                </p>
                <Link href="/tools/doubt-solving">
                  <Button className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                    Start Solving
                  </Button>
                </Link>
              </motion.div>

              {/* Community Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 p-8 text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Community
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Connect with fellow learners, share knowledge, and get help from the community.
                </p>
                <Link href="/community">
                  <Button className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white">
                    Join Community
                  </Button>
                </Link>
              </motion.div>

              {/* Study Resources Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 p-8 text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Study Resources
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Access curated study materials, notes, and resources for your subjects.
                </p>
                <Button
                  variant="outline"
                  className="mt-6 w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  disabled
                >
                  Coming Soon
                </Button>
              </motion.div>
            </div>
          </section>

          {/* Quick Stats */}
          <section className="mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Your Learning Journey
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">AI-Powered Learning</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Get personalized help with our advanced AI assistant
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Community Support</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Learn together with peers and share knowledge
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Quality Resources</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Access curated study materials and resources
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className={`relative transition-all duration-300 ${sidebarOpen ? "md:ml-64" : ""}`}>
        <Footer />
      </footer>
    </div>
  );
};

export default HomePage;

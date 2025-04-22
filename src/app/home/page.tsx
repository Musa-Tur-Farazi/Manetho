"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  FileText,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Award,
  Star,
  BookMarked,
  PlusCircle,
  ChevronRight,
  ArrowRight,
  Brain,
  Trophy,
  LayoutDashboard,
  Network,
  Menu,
  X,
  Home,
  Settings,
  HelpCircle,
  User,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/theme/ThemeProvider";
import AuthenticatedNavbar from "../../../components/homepage/AuthenticatedNavbar";
import Footer from "../../../components/landingpage/section/Footer";
import AiDoubtSolver from "../../../components/homepage/AiDoubtSolver";

// Sample data for recent subjects
const recentSubjects = [
  {
    id: 1,
    name: "Biology",
    chapter: "Cell Biology",
    progress: 65,
    icon: <BookOpen className="w-5 h-5" />,
    color: "bg-emerald-100 dark:bg-emerald-900/30",
    textColor: "text-emerald-600 dark:text-emerald-400",
    ringColor: "ring-emerald-600/20 dark:ring-emerald-400/20",
    lastStudied: "2 hours ago",
  },
  {
    id: 2,
    name: "Physics",
    chapter: "Thermodynamics",
    progress: 42,
    icon: <Network className="w-5 h-5" />,
    color: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-600 dark:text-blue-400",
    ringColor: "ring-blue-600/20 dark:ring-blue-400/20",
    lastStudied: "Yesterday",
  },
  {
    id: 3,
    name: "Chemistry",
    chapter: "Organic Chemistry",
    progress: 78,
    icon: <FileText className="w-5 h-5" />,
    color: "bg-purple-100 dark:bg-purple-900/30",
    textColor: "text-purple-600 dark:text-purple-400",
    ringColor: "ring-purple-600/20 dark:ring-purple-400/20",
    lastStudied: "3 days ago",
  },
];

// Sample data for recommended resources
const recommendedResources = [
  {
    id: 1,
    title: "Understanding Cell Structures",
    type: "Video Lecture",
    author: "Dr. Sarah Chen",
    duration: "48 mins",
    thumbnail: "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    subject: "Biology",
  },
  {
    id: 2,
    title: "Laws of Thermodynamics Explained",
    type: "Interactive Module",
    author: "Prof. Michael Reed",
    duration: "35 mins",
    thumbnail: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    subject: "Physics",
  },
  {
    id: 3,
    title: "Functional Groups in Organic Chemistry",
    type: "Practice Quiz",
    author: "Dr. Emily Zhao",
    duration: "20 mins",
    thumbnail: "https://images.unsplash.com/photo-1616198814651-e71f960c3180?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    subject: "Chemistry",
  },
];

// Sample upcoming tasks
const upcomingTasks = [
  {
    id: 1,
    title: "Biology Quiz",
    subject: "Cell Structures",
    date: "Tomorrow",
    time: "10:00 AM",
    priority: "High",
  },
  {
    id: 2,
    title: "Physics Study Session",
    subject: "Thermodynamics",
    date: "Wed, May 15",
    time: "3:00 PM",
    priority: "Medium",
  },
  {
    id: 3,
    title: "Chemistry Practice Problems",
    subject: "Organic Reactions",
    date: "Fri, May 17",
    time: "2:00 PM",
    priority: "Medium",
  },
];

// Study tools
const studyTools = [
  { name: "Flashcards", icon: <BookMarked className="w-5 h-5" />, color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400", href: "/tools/flashcards" },
  { name: "Practice Tests", icon: <FileText className="w-5 h-5" />, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400", href: "/tools/practice-tests" },
  { name: "Study Analytics", icon: <BarChart3 className="w-5 h-5" />, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400", href: "/tools/analytics" },
  { name: "Mind Maps", icon: <Network className="w-5 h-5" />, color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400", href: "/tools/mind-maps" },
  { name: "Achievements", icon: <Trophy className="w-5 h-5" />, color: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400", href: "/tools/achievements" },
  { name: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, color: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400", href: "/home" },
];

// Sample learning stats
const learningStats = [
  {
    label: "Study Hours",
    value: "28",
    unit: "hrs",
    change: "+12%",
    icon: <Clock className="w-5 h-5" />,
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    label: "Quizzes Completed",
    value: "16",
    unit: "",
    change: "+4",
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: "text-green-600 dark:text-green-400",
  },
  {
    label: "Current Streak",
    value: "7",
    unit: "days",
    change: "",
    icon: <Award className="w-5 h-5" />,
    color: "text-amber-600 dark:text-amber-400",
  },
  {
    label: "Mastery Score",
    value: "84",
    unit: "%",
    change: "+3%",
    icon: <Brain className="w-5 h-5" />,
    color: "text-purple-600 dark:text-purple-400",
  },
];

const HomePage = () => {
  const { user } = useUser();
  const { theme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const firstName = user?.firstName || user?.username?.split(' ')[0] || "there";

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
                    href="/subjects"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                  >
                    <BookOpen className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                    My Subjects
                  </Link>
                  <Link
                    href="/calendar"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                  >
                    <Calendar className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                    Study Calendar
                  </Link>
                  <Link
                    href="/resources"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                  >
                    <BookMarked className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                    Resources
                  </Link>
                </nav>
              </div>

              {/* Study Tools Section */}
              <div id="tools-section" className="mb-8">
                <h3 className="text-gray-400 dark:text-gray-500 text-xs uppercase font-semibold tracking-wider mb-4 px-2">
                  Study Tools
                </h3>
                <nav className="space-y-1.5">
                  {studyTools.map((tool) => (
                    <Link
                      key={tool.name}
                      href={tool.href}
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                    >
                      <span className={`w-5 h-5 mr-3 ${tool.color.split(' ').slice(2).join(' ')}`}>
                        {tool.icon}
                      </span>
                      {tool.name}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Settings */}
              <div className="mb-8">
                <h3 className="text-gray-400 dark:text-gray-500 text-xs uppercase font-semibold tracking-wider mb-4 px-2">
                  Account
                </h3>
                <nav className="space-y-1.5">
                  <Link
                    href="/profile"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                  >
                    <User className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                    Profile
                  </Link>
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {firstName}!
                </h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                  Continue your learning journey where you left off.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="border-gray-200 dark:border-gray-700"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Study Planner
                </Button>
                <Button
                  className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-800 text-white"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  New Study Session
                </Button>
              </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {learningStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                      <div className="flex items-baseline mt-1">
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                        {stat.unit && (
                          <p className="ml-1 text-sm text-gray-500 dark:text-gray-400">{stat.unit}</p>
                        )}
                      </div>
                      {stat.change && (
                        <p className="text-xs font-medium text-green-600 dark:text-green-400 mt-1">{stat.change} from last week</p>
                      )}
                    </div>
                    <div className={`p-2 rounded-lg ${stat.color.replace('text-', 'bg-').replace('600', '100').replace('400', '900/30')}`}>
                      <span className={stat.color}>{stat.icon}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Continue Learning Section */}
          <section id="learning-section" className="mb-12 scroll-mt-24">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Continue Learning</h2>
              <Link href="/subjects" className="text-cyan-600 dark:text-cyan-400 flex items-center text-sm font-medium hover:underline">
                View all subjects
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentSubjects.map((subject, index) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-700 p-5"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2.5 rounded-lg ${subject.color}`}>
                      {subject.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{subject.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{subject.chapter}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{subject.progress}% complete</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Last studied: {subject.lastStudied}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${subject.textColor.replace('text-', 'bg-')}`}
                        style={{ width: `${subject.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between gap-2">
                    <Button
                      variant="outline"
                      className="w-1/2"
                      size="sm"
                    >
                      Review Notes
                    </Button>
                    <Button
                      className={`w-1/2 ${subject.textColor.replace('text-', 'bg-')} hover:${subject.textColor.replace('text-', 'bg-').replace('600', '700').replace('400', '500')} text-white`}
                      size="sm"
                    >
                      Continue
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Two column section: Recommended and Upcoming */}
          <div id="resources-section" className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 scroll-mt-24">
            {/* Recommended Resources */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recommended For You</h2>
                <Link href="/resources" className="text-cyan-600 dark:text-cyan-400 flex items-center text-sm font-medium hover:underline">
                  View all
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              <div className="space-y-4">
                {recommendedResources.map((resource, index) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden flex"
                  >
                    <div className="w-1/3 h-32 overflow-hidden">
                      <img
                        src={resource.thumbnail}
                        alt={resource.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-2/3 p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="px-2 py-1 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 text-xs rounded-full mb-2">
                            {resource.type}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{resource.duration}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{resource.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{resource.author} • {resource.subject}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="justify-start p-0 hover:bg-transparent text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300">
                        Start learning
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Upcoming Tasks */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upcoming Tasks</h2>
                <Link href="/calendar" className="text-cyan-600 dark:text-cyan-400 flex items-center text-sm font-medium hover:underline">
                  View calendar
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">This Week</h3>
                  <Button variant="ghost" size="sm" className="text-cyan-600 dark:text-cyan-400">
                    <PlusCircle className="w-4 h-4 mr-1" />
                    Add Task
                  </Button>
                </div>

                <div className="space-y-4">
                  {upcomingTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`p-3 rounded-lg border ${task.priority === "High"
                        ? "border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10"
                        : "border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60"
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{task.subject}</p>
                        </div>
                        {task.priority === "High" && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                            High Priority
                          </span>
                        )}
                      </div>
                      <div className="flex items-center mt-2">
                        <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-1" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-3">{task.date}</span>
                        <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-1" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{task.time}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <Link href="/tasks" className="text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-sm font-medium hover:underline">
                    View all tasks
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className={`relative transition-all duration-300 ${sidebarOpen ? "md:ml-64" : ""}`}>
        <Footer />
      </footer>
    </div>
  );
};

export default HomePage;

"use client";

import { useState, useEffect, useRef } from "react";
import { SignedIn, SignOutButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  Youtube,
  CheckSquare,
  Network,
  Menu,
  X,
  LogOut,
  ChevronRight,
  BookMarked,
  BookOpenCheck,
  ListChecks,
  User,
  Bell,
  Search,
  ChevronDown,
  Home,
  Settings,
  Moon,
  Sun,
  MoreHorizontal,
  GraduationCap,
  Book,
  HelpCircle,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/theme/ThemeProvider";

// Sample data for the medical exam subjects and chapters
const subjects = [
  {
    name: "Biology",
    chapters: ["Cell Biology", "Genetics", "Human Physiology", "Ecology"],
    icon: <BookOpen className="w-5 h-5" />,
    color: "bg-emerald-100 dark:bg-emerald-900/30",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    name: "Physics",
    chapters: ["Mechanics", "Thermodynamics", "Waves", "Optics"],
    icon: <Network className="w-5 h-5" />,
    color: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  {
    name: "Chemistry",
    chapters: ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Biochemistry"],
    icon: <FileText className="w-5 h-5" />,
    color: "bg-purple-100 dark:bg-purple-900/30",
    textColor: "text-purple-600 dark:text-purple-400",
  },
  {
    name: "Mathematics",
    chapters: ["Algebra", "Calculus", "Geometry", "Statistics"],
    icon: <ListChecks className="w-5 h-5" />,
    color: "bg-red-100 dark:bg-red-900/30",
    textColor: "text-red-600 dark:text-red-400",
  },
];

// Selected chapter content example
const selectedChapterContent = {
  title: "Cell Biology",
  gist: {
    breakdown:
      "Cell biology is the study of cell structure and function. It focuses on organelles, cell division, and cell signaling pathways. Key topics include cell membrane, nucleus, mitochondria, endoplasmic reticulum, and cell cycle.",
    previousYearAnalysis:
      "Cell biology questions appeared 12 times in the last 5 years, making up approximately 15% of the biology section. Focus areas: mitosis vs meiosis, membrane transport, and organelle functions.",
  },
  suggestions: {
    youtube: ["Khan Academy: Cell Biology", "Ninja Nerd: Cell Structure", "Bozeman Science: Cell Transport"],
    books: ["Campbell Biology", "Molecular Biology of the Cell", "Essential Cell Biology"],
    readingMaterials: ["NCBI Cell Structure Resources", "Nature Reviews Cell Biology", "Journal of Cell Science"],
  },
  todoList: [
    { task: "Memorize all cell organelles and functions", completed: false },
    { task: "Practice drawing cell cycle diagrams", completed: true },
    { task: "Review membrane transport mechanisms", completed: false },
    { task: "Complete quiz on cell division", completed: false },
  ],
  mindmap: {
    central: "Cell Biology",
    branches: [
      {
        name: "Cell Structure",
        topics: ["Membrane", "Cytoplasm", "Nucleus", "Organelles"],
      },
      {
        name: "Cell Division",
        topics: ["Mitosis", "Meiosis", "Cell Cycle"],
      },
      {
        name: "Cell Transport",
        topics: ["Diffusion", "Active Transport", "Osmosis"],
      },
      {
        name: "Cell Communication",
        topics: ["Signaling", "Receptors", "Hormones"],
      },
    ],
  },
};

const MenuLink = ({ icon, text, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-200 ${active
      ? "bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 text-cyan-700 dark:text-cyan-400 font-medium"
      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-gray-800/60"
      }`}
  >
    <div className={`${active ? "text-cyan-600 dark:text-cyan-400" : "text-gray-500 dark:text-gray-400"}`}>
      {icon}
    </div>
    <span>{text}</span>
  </button>
);

const HomePage = () => {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("subjects");
  const [selectedSubject, setSelectedSubject] = useState("Biology");
  const [selectedChapter, setSelectedChapter] = useState("Cell Biology");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New chapter added: Microbiology", read: false },
    { id: 2, message: "Quiz reminder: Cell Biology tomorrow", read: false },
  ]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);
  const settingsRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setSettingsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Filter subjects based on search query
  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.chapters.some(chapter =>
      chapter.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Content rendering based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "subjects":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="animate-fadeIn"
          >
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Subjects and Chapters
              </h2>
              <Button
                className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-800 text-white"
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                New Study Session
              </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
              {filteredSubjects.map((subject) => (
                <motion.div
                  key={subject.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-5 border border-gray-100 dark:border-gray-700"
                >
                  <div
                    className={`flex justify-between items-center cursor-pointer ${subject.name === selectedSubject
                        ? subject.textColor
                        : "text-gray-800 dark:text-white"
                      }`}
                    onClick={() => setSelectedSubject(subject.name)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg ${subject.color}`}>
                        {subject.icon}
                      </div>
                      <h3 className="text-lg font-semibold">{subject.name}</h3>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${subject.name === selectedSubject ? "rotate-180" : ""
                      }`} />
                  </div>

                  <AnimatePresence>
                    {subject.name === selectedSubject && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 ml-6 grid gap-2 overflow-hidden"
                      >
                        {subject.chapters.map((chapter) => (
                          <motion.div
                            key={chapter}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${chapter === selectedChapter
                                ? "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300"
                                : "hover:bg-gray-50 dark:hover:bg-gray-700/30"
                              }`}
                            onClick={() => setSelectedChapter(chapter)}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${chapter === selectedChapter
                                  ? "bg-cyan-600 dark:bg-cyan-400"
                                  : "bg-gray-400 dark:bg-gray-500"
                                }`}
                            ></div>

                            <span className="dark:text-gray-300">{chapter}</span>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case "content":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {selectedChapter}
                  </h2>
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {selectedSubject}
                  </span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Key concepts and detailed breakdown of this chapter
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="border-gray-200 dark:border-gray-700">
                  <BookMarked className="w-4 h-4 mr-2" />
                  Bookmark
                </Button>
                <Button className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-800">
                  Take Practice Quiz
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700"
              >
                <h3 className="text-xl font-semibold mb-4 text-cyan-700 dark:text-cyan-400 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Chapter Breakdown
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedChapterContent.gist.breakdown}
                </p>

                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Key Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Cell membrane", "Nucleus", "Mitochondria", "Cell cycle", "Organelles"].map((topic, i) => (
                      <span key={i} className="bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs px-2.5 py-1 rounded-full">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700"
              >
                <h3 className="text-xl font-semibold mb-4 text-cyan-700 dark:text-cyan-400 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Previous Year Analysis
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedChapterContent.gist.previousYearAnalysis}
                </p>

                <div className="mt-6 bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg border border-cyan-100 dark:border-cyan-800/30">
                  <h4 className="font-medium text-cyan-800 dark:text-cyan-300 mb-2">Important for Exam</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <div className="mt-1 min-w-4 text-cyan-600 dark:text-cyan-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-sm ml-2">
                        Compare and contrast mitosis vs meiosis
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="mt-1 min-w-4 text-cyan-600 dark:text-cyan-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-sm ml-2">
                        Membrane transport mechanisms
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="mt-1 min-w-4 text-cyan-600 dark:text-cyan-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-sm ml-2">
                        Functions of organelles
                      </span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700"
            >
              <h3 className="text-xl font-semibold mb-4 text-cyan-700 dark:text-cyan-400">Interactive Learning</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30 flex flex-col items-center text-center">
                  <Youtube className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Watch Video Lectures</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    3 video tutorials available
                  </p>
                  <Button variant="outline" className="mt-3 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50">
                    Watch Videos
                  </Button>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800/30 flex flex-col items-center text-center">
                  <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Practice Questions</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    45 questions in the bank
                  </p>
                  <Button variant="outline" className="mt-3 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/50">
                    Start Practice
                  </Button>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800/30 flex flex-col items-center text-center">
                  <Network className="w-8 h-8 text-amber-600 dark:text-amber-400 mb-2" />
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Interactive Diagrams</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Explore cell structure in 3D
                  </p>
                  <Button variant="outline" className="mt-3 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50">
                    View Diagrams
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        );

      case "suggestions":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              Learning Resources for {selectedChapter}
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              {/* YouTube Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <Youtube className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    YouTube Content
                  </h3>
                </div>
                <ul className="space-y-3">
                  {selectedChapterContent.suggestions.youtube.map(
                    (item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="mt-1 min-w-4">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">{item}</span>
                      </li>
                    )
                  )}
                </ul>

                <Button className="w-full mt-4 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800">
                  <Youtube className="w-4 h-4 mr-2" />
                  Open YouTube
                </Button>
              </motion.div>

              {/* Books */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Recommended Books
                  </h3>
                </div>
                <ul className="space-y-3">
                  {selectedChapterContent.suggestions.books.map(
                    (item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="mt-1 min-w-4">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">{item}</span>
                      </li>
                    )
                  )}
                </ul>

                <Button variant="outline" className="w-full mt-4 border-amber-200 dark:border-amber-800/50 text-amber-600 dark:text-amber-400">
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Library
                </Button>
              </motion.div>

              {/* Reading Material */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Reading Material
                  </h3>
                </div>
                <ul className="space-y-3">
                  {selectedChapterContent.suggestions.readingMaterials.map(
                    (item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="mt-1 min-w-4">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">{item}</span>
                      </li>
                    )
                  )}
                </ul>

                <Button variant="outline" className="w-full mt-4 border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400">
                  <FileText className="w-4 h-4 mr-2" />
                  Browse Articles
                </Button>
              </motion.div>
            </div>
          </motion.div>
        );

      case "todo":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              To-Do List for {selectedChapter}
            </h2>

            <div className="bg-white rounded-xl shadow-md p-6">
              <ul className="space-y-4">
                {selectedChapterContent.todoList.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md"
                  >
                    <div
                      className={`p-1 rounded ${item.completed
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                        }`}
                    >
                      <CheckSquare className="w-5 h-5" />
                    </div>
                    <span
                      className={`${item.completed
                        ? "line-through text-gray-500"
                        : "text-gray-800"
                        }`}
                    >
                      {item.task}
                    </span>
                  </li>
                ))}
              </ul>

              <Button className="mt-6 bg-cyan-600 hover:bg-cyan-700 w-full">
                Add New Task
              </Button>
            </div>
          </div>
        );

      case "summary":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {selectedChapter} Summary
            </h2>

            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4 text-cyan-700">
                Key Concepts
              </h3>
              <p className="text-gray-700">
                {selectedChapterContent.gist.breakdown}
              </p>
            </div>

            {/* Mindmap visualization */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold mb-6 text-cyan-700">
                Concept Map
              </h3>

              <div className="relative p-4 h-[400px] bg-gray-50 rounded-lg overflow-hidden">
                {/* Central concept */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-cyan-100 border-2 border-cyan-500 rounded-lg p-3 w-32 text-center">
                  <span className="font-medium text-cyan-800">
                    {selectedChapterContent.mindmap.central}
                  </span>
                </div>

                {/* Branches */}
                {selectedChapterContent.mindmap.branches.map(
                  (branch, index) => {
                    // Position branches in a circle around the central node
                    const angle =
                      (index / selectedChapterContent.mindmap.branches.length) *
                      2 *
                      Math.PI;
                    const radius = 140; // Distance from center
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;

                    return (
                      <div
                        key={branch.name}
                        className="absolute bg-blue-50 border border-blue-200 rounded-md p-2 w-28 text-center"
                        style={{
                          top: `calc(50% + ${y}px)`,
                          left: `calc(50% + ${x}px)`,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        <span className="text-sm font-medium text-blue-700">
                          {branch.name}
                        </span>

                        {/* Topics under each branch */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs">
                          {branch.topics.map((topic, i) => (
                            <span
                              key={i}
                              className="block bg-gray-100 border border-gray-300 rounded px-2 py-1 mb-1 whitespace-nowrap"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        );

      default:
        return <div>Select a section from the sidebar</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 z-30 px-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link href="/home" className="flex items-center">
            <h1 className="text-xl font-bold text-cyan-600 dark:text-cyan-400 ml-2 md:ml-0">Manetho</h1>
          </Link>

          {/* Navigation links - Desktop */}
          <div className="hidden md:flex items-center ml-8 space-x-4">
            <Link href="/home" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
              Dashboard
            </Link>
            <Link href="/library" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
              Library
            </Link>
            <Link href="/practice" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
              Practice
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full w-[250px] focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm dark:text-gray-200"
              placeholder="Search subjects, chapters..."
            />
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 relative"
            >
              <Bell className="w-5 h-5" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="font-medium">Notifications</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      Mark all as read
                    </button>
                    <button
                      onClick={clearNotifications}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No notifications
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${notification.read ? 'opacity-60' : ''
                          }`}
                      >
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Today</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative ml-2" ref={userMenuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-800 flex items-center justify-center">
                <span className="text-cyan-700 dark:text-cyan-300 font-medium">
                  {user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U"}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="font-medium">{user?.fullName || user?.username || "User"}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.primaryEmailAddress?.emailAddress || "user@example.com"}</p>
                </div>
                <div className="py-1">
                  <Link href="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link href="/settings" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <Link href="/help" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
                    <HelpCircle className="w-4 h-4" />
                    Help & Support
                  </Link>
                </div>
                <div className="py-1 border-t border-gray-200 dark:border-gray-700">
                  <SignedIn>
                    <SignOutButton>
                      <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left text-sm text-red-600 dark:text-red-400">
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </SignOutButton>
                  </SignedIn>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-20 bg-white dark:bg-slate-800 w-64 shadow-lg transform transition-transform duration-300 ease-in-out pt-16 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Search - Mobile */}
          <div className="p-4 md:hidden">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm dark:text-gray-200"
                placeholder="Search..."
              />
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 py-4 px-4 overflow-y-auto">
            <div className="mb-4">
              <p className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Main Menu
              </p>
            </div>
            <ul className="space-y-1">
              <li>
                <MenuLink
                  icon={<BookOpenCheck className="w-5 h-5" />}
                  text="Subjects & Chapters"
                  active={activeTab === "subjects"}
                  onClick={() => setActiveTab("subjects")}
                />
              </li>
              <li>
                <MenuLink
                  icon={<FileText className="w-5 h-5" />}
                  text="Chapter Content"
                  active={activeTab === "content"}
                  onClick={() => setActiveTab("content")}
                />
              </li>
              <li>
                <MenuLink
                  icon={<BookOpen className="w-5 h-5" />}
                  text="Learning Resources"
                  active={activeTab === "suggestions"}
                  onClick={() => setActiveTab("suggestions")}
                />
              </li>
              <li>
                <MenuLink
                  icon={<ListChecks className="w-5 h-5" />}
                  text="To-Do List"
                  active={activeTab === "todo"}
                  onClick={() => setActiveTab("todo")}
                />
              </li>
              <li>
                <MenuLink
                  icon={<Network className="w-5 h-5" />}
                  text="Chapter Summary"
                  active={activeTab === "summary"}
                  onClick={() => setActiveTab("summary")}
                />
              </li>
            </ul>

            <div className="mt-8 mb-4">
              <p className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Quick Access
              </p>
            </div>
            <ul className="space-y-1">
              <li>
                <MenuLink
                  icon={<Book className="w-5 h-5" />}
                  text="Recent Studies"
                  active={false}
                  onClick={() => { }}
                />
              </li>
              <li>
                <MenuLink
                  icon={<BookMarked className="w-5 h-5" />}
                  text="Bookmarked"
                  active={false}
                  onClick={() => { }}
                />
              </li>
            </ul>
          </nav>

          {/* User Area */}
          <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
            <SignedIn>
              <SignOutButton>
                <button className="flex items-center gap-2 px-4 py-2 w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </SignOutButton>
            </SignedIn>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 pt-16 px-4 py-8 md:px-8 md:py-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default HomePage;

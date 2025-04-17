"use client";

import { useState } from "react";
import { SignedIn, SignOutButton } from "@clerk/nextjs";
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
} from "lucide-react";
import { Button } from "../../../components/ui/Button";

// Sample data for the medical exam subjects and chapters
const subjects = [
  {
    name: "Biology",
    chapters: ["Cell Biology", "Genetics"],
  },
  {
    name: "Physics",
    chapters: ["Mechanics", "Thermodynamics"],
  },
  {
    name: "Chemistry",
    chapters: ["Organic Chemistry", "Inorganic Chemistry"],
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
    youtube: ["Khan Academy: Cell Biology"],
    books: ["Campbell Biology"],
    readingMaterials: ["NCBI Cell Structure Resources"],
  },
  todoList: [
    { task: "Memorize all cell organelles and functions", completed: false },
    { task: "Practice drawing cell cycle diagrams", completed: true },
  ],
  mindmap: {
    central: "Cell Biology",
    branches: [
      {
        name: "Cell Structure",
        topics: ["Membrane", "Cytoplasm", "Nucleus", "Organelles"],
      },
    ],
  },
};

const HomePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("subjects");
  const [selectedSubject, setSelectedSubject] = useState("Biology");
  const [selectedChapter, setSelectedChapter] = useState("Cell Biology");
  const [menuOpen, setMenuOpen] = useState(false);

  // Content rendering based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "subjects":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Subjects and Chapters
            </h2>
            <div className="grid gap-6">
              {subjects.map((subject) => (
                <div
                  key={subject.name}
                  className="bg-white rounded-xl shadow-md p-4"
                >
                  <div
                    className={`flex justify-between items-center cursor-pointer ${
                      subject.name === selectedSubject
                        ? "text-cyan-600 font-bold"
                        : "text-gray-800"
                    }`}
                    onClick={() => setSelectedSubject(subject.name)}
                  >
                    <div className="flex items-center gap-2">
                      <BookMarked className="w-5 h-5" />
                      <h3 className="text-lg font-semibold">{subject.name}</h3>
                    </div>
                    <ChevronRight className="w-5 h-5" />
                  </div>

                  {subject.name === selectedSubject && (
                    <div className="mt-4 ml-6 grid gap-2">
                      {subject.chapters.map((chapter) => (
                        <div
                          key={chapter}
                          className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${
                            chapter === selectedChapter
                              ? "bg-cyan-50 text-cyan-700"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => setSelectedChapter(chapter)}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              chapter === selectedChapter
                                ? "bg-cyan-600"
                                : "bg-gray-400"
                            }`}
                          ></div>

                          <span>{chapter}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "content":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {selectedChapter}{" "}
              <span className="text-sm font-normal text-gray-500">
                ({selectedSubject})
              </span>
            </h2>

            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4 text-cyan-700">
                Chapter Breakdown
              </h3>
              <p className="text-gray-700">
                {selectedChapterContent.gist.breakdown}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-cyan-700">
                Previous Year Analysis
              </h3>
              <p className="text-gray-700">
                {selectedChapterContent.gist.previousYearAnalysis}
              </p>
            </div>
          </div>
        );

      case "suggestions":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Learning Resources for {selectedChapter}
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              {/* YouTube Content */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Youtube className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    YouTube Content
                  </h3>
                </div>
                <ul className="space-y-3">
                  {selectedChapterContent.suggestions.youtube.map(
                    (item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="mt-1 min-w-4">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-600"></div>
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Books */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <BookOpen className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Recommended Books
                  </h3>
                </div>
                <ul className="space-y-3">
                  {selectedChapterContent.suggestions.books.map(
                    (item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="mt-1 min-w-4">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-600"></div>
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Reading Material */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Reading Material
                  </h3>
                </div>
                <ul className="space-y-3">
                  {selectedChapterContent.suggestions.readingMaterials.map(
                    (item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="mt-1 min-w-4">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-600"></div>
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
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
                      className={`p-1 rounded ${
                        item.completed
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <CheckSquare className="w-5 h-5" />
                    </div>
                    <span
                      className={`${
                        item.completed
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
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile menu toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-md shadow-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-40 bg-white w-64 shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="px-6 py-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-cyan-600">MedAdmit AI</h1>
            <p className="text-sm text-gray-500 mt-1">
              Bangladesh Medical Exam
            </p>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 py-4 px-4">
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setActiveTab("subjects")}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg ${
                    activeTab === "subjects"
                      ? "bg-cyan-50 text-cyan-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <BookOpenCheck className="w-5 h-5" />
                  <span>Subjects & Chapters</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("content")}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg ${
                    activeTab === "content"
                      ? "bg-cyan-50 text-cyan-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span>Chapter Content</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("suggestions")}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg ${
                    activeTab === "suggestions"
                      ? "bg-cyan-50 text-cyan-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Learning Resources</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("todo")}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg ${
                    activeTab === "todo"
                      ? "bg-cyan-50 text-cyan-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <ListChecks className="w-5 h-5" />
                  <span>To-Do List</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("summary")}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg ${
                    activeTab === "summary"
                      ? "bg-cyan-50 text-cyan-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Network className="w-5 h-5" />
                  <span>Chapter Summary</span>
                </button>
              </li>
            </ul>
          </nav>

          {/* User Area */}
          <div className="mt-auto p-4 border-t border-gray-200">
            <div className="relative">
              <button
                className="flex items-center justify-between w-full px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
                    <span className="text-cyan-700 font-medium">MS</span>
                  </div>
                  <span className="text-gray-800">Medical Student</span>
                </div>
                <ChevronRight
                  className={`w-5 h-5 transition-transform ${
                    menuOpen ? "rotate-90" : ""
                  }`}
                />
              </button>

              {menuOpen && (
                <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 w-full text-left"
                  >
                    Profile
                  </Link>
                  <SignedIn>
                    <SignOutButton>
                      <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-red-600 w-full text-left">
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </SignOutButton>
                  </SignedIn>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-8 md:px-8 md:py-10">
        <div className="max-w-5xl mx-auto">{renderContent()}</div>
      </div>
    </div>
  );
};

export default HomePage;

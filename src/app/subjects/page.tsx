"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Network, FileText, BookMarked, Search, Filter, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "../../../components/ui/Button";

const subjectData = [
  {
    id: 1,
    name: "Mathematics",
    topics: 12,
    resources: 45,
    progress: 65,
    icon: <Network className="w-6 h-6" />,
    color: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: 2,
    name: "Physics",
    topics: 10,
    resources: 38,
    progress: 42,
    icon: <FileText className="w-6 h-6" />,
    color: "bg-purple-100 dark:bg-purple-900/30",
    textColor: "text-purple-600 dark:text-purple-400",
  },
  {
    id: 3,
    name: "Chemistry",
    topics: 8,
    resources: 32,
    progress: 78,
    icon: <BookOpen className="w-6 h-6" />,
    color: "bg-emerald-100 dark:bg-emerald-900/30",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: 4,
    name: "Biology",
    topics: 9,
    resources: 40,
    progress: 51,
    icon: <BookMarked className="w-6 h-6" />,
    color: "bg-amber-100 dark:bg-amber-900/30",
    textColor: "text-amber-600 dark:text-amber-400",
  },
  {
    id: 5,
    name: "Computer Science",
    topics: 7,
    resources: 28,
    progress: 35,
    icon: <Network className="w-6 h-6" />,
    color: "bg-cyan-100 dark:bg-cyan-900/30",
    textColor: "text-cyan-600 dark:text-cyan-400",
  },
  {
    id: 6,
    name: "History",
    topics: 6,
    resources: 22,
    progress: 20,
    icon: <BookOpen className="w-6 h-6" />,
    color: "bg-red-100 dark:bg-red-900/30",
    textColor: "text-red-600 dark:text-red-400",
  },
  {
    id: 7,
    name: "Geography",
    topics: 5,
    resources: 18,
    progress: 15,
    icon: <FileText className="w-6 h-6" />,
    color: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-600 dark:text-green-400",
  },
  {
    id: 8,
    name: "English Literature",
    topics: 8,
    resources: 30,
    progress: 45,
    icon: <BookMarked className="w-6 h-6" />,
    color: "bg-indigo-100 dark:bg-indigo-900/30",
    textColor: "text-indigo-600 dark:text-indigo-400",
  },
];

export default function SubjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredSubjects = subjectData.filter(subject => 
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            My Subjects
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Manage and explore your learning subjects
          </p>
        </div>
        <Button
          className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-800 text-white min-w-[160px]"
        >
          Add New Subject
        </Button>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-700 focus:border-transparent"
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className="sm:w-auto min-w-[100px]"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Subjects grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSubjects.map((subject, index) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-700 p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-lg ${subject.color}`}>
                <span className={subject.textColor}>{subject.icon}</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{subject.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{subject.topics} topics • {subject.resources} resources</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{subject.progress}% complete</span>
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
                className="w-1/2 min-w-[120px]"
                size="sm"
              >
                Resources
              </Button>
              <Button
                className={`w-1/2 min-w-[100px] ${subject.textColor.replace('text-', 'bg-')} hover:${subject.textColor.replace('text-', 'bg-').replace('600', '700').replace('400', '500')} text-white`}
                size="sm"
              >
                Study
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 
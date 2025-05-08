"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Video, FileText, BookMarked, Search, Filter, Star, Clock, Download, ChevronRight, Plus } from "lucide-react";
import { Button } from "../../../components/ui/Button";

// Sample data for resources
const resourcesData = [
  {
    id: 1,
    title: "Understanding Cell Structures",
    type: "Video Lecture",
    subject: "Biology",
    author: "Dr. Sarah Chen",
    duration: "48 mins",
    thumbnail: "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    rating: 4.8,
    views: 2453,
    date: "Apr 15, 2025",
    icon: <Video className="w-5 h-5" />,
    color: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: 2,
    title: "Laws of Thermodynamics Explained",
    type: "Interactive Module",
    subject: "Physics",
    author: "Prof. Michael Reed",
    duration: "35 mins",
    thumbnail: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    rating: 4.6,
    views: 1897,
    date: "Apr 10, 2025",
    icon: <BookOpen className="w-5 h-5" />,
    color: "bg-purple-100 dark:bg-purple-900/30",
    textColor: "text-purple-600 dark:text-purple-400",
  },
  {
    id: 3,
    title: "Functional Groups in Organic Chemistry",
    type: "Practice Quiz",
    subject: "Chemistry",
    author: "Dr. Emily Zhao",
    duration: "20 mins",
    thumbnail: "https://images.unsplash.com/photo-1616198814651-e71f960c3180?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    rating: 4.5,
    views: 1245,
    date: "Mar 28, 2025",
    icon: <FileText className="w-5 h-5" />,
    color: "bg-emerald-100 dark:bg-emerald-900/30",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: 4,
    title: "Calculus: Derivatives and Integrals",
    type: "Study Notes",
    subject: "Mathematics",
    author: "Prof. David Wong",
    duration: "15 pages",
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    rating: 4.9,
    views: 3421,
    date: "Apr 05, 2025",
    icon: <BookMarked className="w-5 h-5" />,
    color: "bg-amber-100 dark:bg-amber-900/30",
    textColor: "text-amber-600 dark:text-amber-400",
  },
  {
    id: 5,
    title: "Introduction to Quantum Mechanics",
    type: "Video Lecture",
    subject: "Physics",
    author: "Dr. Richard Feynman",
    duration: "65 mins",
    thumbnail: "https://images.unsplash.com/photo-1617791160536-598cf32026fb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    rating: 4.7,
    views: 2876,
    date: "Mar 20, 2025",
    icon: <Video className="w-5 h-5" />,
    color: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: 6,
    title: "DNA Replication and Protein Synthesis",
    type: "Study Notes",
    subject: "Biology",
    author: "Dr. Maria Garcia",
    duration: "22 pages",
    thumbnail: "https://images.unsplash.com/photo-1696252157408-e20c549dc871?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    rating: 4.6,
    views: 1598,
    date: "Apr 12, 2025",
    icon: <BookMarked className="w-5 h-5" />,
    color: "bg-amber-100 dark:bg-amber-900/30",
    textColor: "text-amber-600 dark:text-amber-400",
  },
];

// Resource type filters
const resourceTypes = [
  { id: 'all', name: 'All Types', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'video', name: 'Video Lectures', icon: <Video className="w-4 h-4" /> },
  { id: 'notes', name: 'Study Notes', icon: <BookMarked className="w-4 h-4" /> },
  { id: 'quiz', name: 'Practice Quizzes', icon: <FileText className="w-4 h-4" /> },
];

// Subject filters
const subjects = [
  { id: 'all', name: 'All Subjects' },
  { id: 'mathematics', name: 'Mathematics' },
  { id: 'physics', name: 'Physics' },
  { id: 'chemistry', name: 'Chemistry' },
  { id: 'biology', name: 'Biology' },
];

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  
  // Filter resources based on search term, type and subject
  const filteredResources = resourcesData.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === "all" || 
                       (selectedType === "video" && resource.type === "Video Lecture") ||
                       (selectedType === "notes" && resource.type === "Study Notes") ||
                       (selectedType === "quiz" && resource.type === "Practice Quiz");
    
    const matchesSubject = selectedSubject === "all" || 
                          resource.subject.toLowerCase() === selectedSubject.toLowerCase();
    
    return matchesSearch && matchesType && matchesSubject;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Resources Library
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Explore our collection of study materials and resources
          </p>
        </div>
        <Button
          className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-800 text-white min-w-[180px]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload Resource
        </Button>
      </div>

      {/* Search and filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-700 focus:border-transparent"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="sm:w-auto min-w-[120px]"
          >
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>

        {/* Resource type filters */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Resource Type</h3>
          <div className="flex flex-wrap gap-2">
            {resourceTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm min-w-[120px] justify-center ${
                  selectedType === type.id
                    ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-1.5">{type.icon}</span>
                {type.name}
              </button>
            ))}
          </div>
        </div>

        {/* Subject filters */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</h3>
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                className={`px-3 py-1.5 rounded-full text-sm min-w-[100px] text-center ${
                  selectedSubject === subject.id
                    ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {subject.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resources grid */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource, index) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              <div className="relative h-48">
                <img
                  src={resource.thumbnail}
                  alt={resource.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${resource.color} ${resource.textColor}`}>
                    <span className="mr-1">{resource.icon}</span>
                    {resource.type}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-900/60 text-white">
                    {resource.subject}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                  {resource.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {resource.author}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-sm">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-gray-700 dark:text-gray-300 mr-1">{resource.rating}</span>
                    <span className="text-gray-500 dark:text-gray-400">({resource.views})</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4 mr-1" />
                    {resource.duration}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="w-1/2 min-w-[100px]"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    Save
                  </Button>
                  <Button
                    className={`w-1/2 min-w-[120px] ${resource.textColor.replace('text-', 'bg-')} hover:${resource.textColor.replace('text-', 'bg-').replace('600', '700').replace('400', '500')} text-white`}
                    size="sm"
                  >
                    View Resource
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">No resources found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
            We couldn't find any resources matching your search. Try adjusting your filters or search term.
          </p>
          <Button
            variant="outline"
            className="min-w-[140px]"
            onClick={() => {
              setSearchTerm("");
              setSelectedType("all");
              setSelectedSubject("all");
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
} 
"use client";

import { useState } from "react";
import {
  BookOpen,
  Search,
  Plus,
  ChevronRight,
  Brain,
  Clock,
  Star,
  UserPlus,
  BarChart2,
} from "lucide-react";
import { Button } from "../../../../../components/ui/Button";
import PageHeader from "../../../../../components/ui/PageHeader";
import ContentCard from "../../../../../components/ui/ContentCard";

interface FlashcardSet {
  id: string;
  title: string;
  subject: string;
  cardsCount: number;
  author: string;
  rating: number;
  reviewCount: number;
  isPublic: boolean;
  isFeatured?: boolean;
  image?: string;
  color: string;
}

export default function FlashcardsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    "All",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "Languages",
  ];

  const [activeCategory, setActiveCategory] = useState("All");

  const flashcardSets: FlashcardSet[] = [
    {
      id: "1",
      title: "Algebra Fundamentals",
      subject: "Mathematics",
      cardsCount: 45,
      author: "Sarah Johnson",
      rating: 4.8,
      reviewCount: 342,
      isPublic: true,
      isFeatured: true,
      image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=2070&auto=format&fit=crop",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "2",
      title: "Physics: Motion & Forces",
      subject: "Physics",
      cardsCount: 32,
      author: "Alex Martinez",
      rating: 4.7,
      reviewCount: 218,
      isPublic: true,
      isFeatured: true,
      image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=1974&auto=format&fit=crop",
      color: "from-purple-500 to-indigo-500",
    },
    {
      id: "3",
      title: "Organic Chemistry Reactions",
      subject: "Chemistry",
      cardsCount: 64,
      author: "Dr. Lisa Chen",
      rating: 4.9,
      reviewCount: 176,
      isPublic: true,
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070&auto=format&fit=crop",
      color: "from-green-500 to-teal-500",
    },
    {
      id: "4",
      title: "Cell Biology Essentials",
      subject: "Biology",
      cardsCount: 38,
      author: "Prof. James Wilson",
      rating: 4.6,
      reviewCount: 154,
      isPublic: true,
      image: "https://images.unsplash.com/photo-1579154392429-a8ff269925ba?q=80&w=2070&auto=format&fit=crop",
      color: "from-red-500 to-orange-500",
    },
    {
      id: "5",
      title: "World History: Modern Era",
      subject: "History",
      cardsCount: 72,
      author: "Emma Thompson",
      rating: 4.7,
      reviewCount: 198,
      isPublic: true,
      image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=2074&auto=format&fit=crop",
      color: "from-amber-500 to-yellow-500",
    },
    {
      id: "6",
      title: "Spanish Vocabulary",
      subject: "Languages",
      cardsCount: 120,
      author: "Carlos Rodriguez",
      rating: 4.8,
      reviewCount: 287,
      isPublic: true,
      image: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?q=80&w=2073&auto=format&fit=crop",
      color: "from-pink-500 to-rose-500",
    },
  ];

  const features = [
    {
      title: "Spaced Repetition",
      description: "Our adaptive algorithm optimizes your review schedule to maximize retention",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      title: "Smart Flashcards",
      description: "AI-powered suggestions for effective learning based on your performance",
      icon: <Brain className="h-5 w-5" />,
    },
    {
      title: "Progress Analytics",
      description: "Track your learning progress with detailed statistics and insights",
      icon: <BarChart2 className="h-5 w-5" />,
    },
    {
      title: "Collaborative Learning",
      description: "Share and study flashcards with friends or classmates",
      icon: <UserPlus className="h-5 w-5" />,
    },
  ];

  const filteredSets = flashcardSets.filter((set) => {
    const matchesCategory = activeCategory === "All" || set.subject === activeCategory;
    const matchesSearch = set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredSets = flashcardSets.filter(set => set.isFeatured);

  return (
    <>
      <PageHeader
        title="Flashcards"
        description="Create, study, and share flashcards to accelerate your learning"
      >
        <div className="flex gap-4 mt-8">
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Create Flashcards
          </Button>
          <Button variant="outline" size="lg">
            Browse Library
          </Button>
        </div>
      </PageHeader>

      {featuredSets.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Featured Flashcard Sets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredSets.map((set) => (
              <div
                key={set.id}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="h-48 relative overflow-hidden">
                  {set.image && (
                    <img
                      src={set.image}
                      alt={set.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                    <div>
                      <span className="text-sm font-medium px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm mb-2 inline-block">
                        {set.subject}
                      </span>
                      <h3 className="text-xl font-bold text-white">{set.title}</h3>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {set.rating} ({set.reviewCount} reviews)
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {set.cardsCount} cards
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Created by {set.author}
                  </p>
                  <Button className="w-full justify-center">
                    Start Studying
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === category
                    ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="search"
              className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-600 text-sm dark:text-gray-300 dark:placeholder-gray-500"
              placeholder="Search flashcards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSets.length > 0 ? (
            filteredSets.map((set) => (
              <div
                key={set.id}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 relative"
              >
                <div className={`h-2 bg-gradient-to-r ${set.color}`}></div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {set.title}
                  </h3>
                  <div className="flex items-center mb-4">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                      {set.subject}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      {set.cardsCount} cards
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {set.rating} ({set.reviewCount})
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      By {set.author}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 justify-center">
                      Preview
                    </Button>
                    <Button className="flex-1 justify-center">
                      Study
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No flashcard sets found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search or create a new flashcard set
              </p>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create Flashcards
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Enhanced Learning Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center mb-4 text-cyan-600 dark:text-cyan-400">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Take Your Learning to the Next Level
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
          Combine flashcards with our other learning tools for a comprehensive study experience.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="outline" className="flex items-center">
            Try AI Doubt Solving
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" className="flex items-center">
            Join Study Groups
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
} 
"use client";

import { useState } from "react";
import { Search, BookOpen, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    "All",
    "Study Tips",
    "AI Learning",
    "Educational Technology",
    "Subject Guides",
    "Student Life",
  ];

  const [activeCategory, setActiveCategory] = useState("All");

  const blogPosts = [
    {
      id: 1,
      title: "How AI is Transforming Education in 2024",
      excerpt: "Explore the latest AI technologies revolutionizing the educational landscape and enhancing student learning experiences.",
      category: "AI Learning",
      author: "Dr. Sarah Chen",
      date: "June 12, 2024",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=2070&auto=format&fit=crop",
    },
    {
      id: 2,
      title: "10 Effective Study Techniques Backed by Science",
      excerpt: "Discover research-backed study methods that can significantly improve information retention and exam performance.",
      category: "Study Tips",
      author: "Marco Rodriguez",
      date: "May 27, 2024",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2073&auto=format&fit=crop",
    },
    {
      id: 3,
      title: "Understanding Complex Physics Concepts with Simple Analogies",
      excerpt: "Breaking down advanced physics theories into easy-to-understand concepts using everyday examples and analogies.",
      category: "Subject Guides",
      author: "Prof. Alan Murray",
      date: "May 15, 2024",
      readTime: "10 min read",
      image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=1974&auto=format&fit=crop",
    },
    {
      id: 4,
      title: "Digital Tools That Every Student Should Know About",
      excerpt: "A curated list of essential digital tools and resources that can enhance productivity and learning for modern students.",
      category: "Educational Technology",
      author: "Lily Wang",
      date: "April 30, 2024",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1536148935331-408321065b18?q=80&w=1974&auto=format&fit=crop",
    },
    {
      id: 5,
      title: "Balancing Academics and Mental Health: A Student's Guide",
      excerpt: "Practical advice for maintaining mental wellbeing while navigating the challenges of academic life and pressures.",
      category: "Student Life",
      author: "Dr. Michael Torres",
      date: "April 18, 2024",
      readTime: "9 min read",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop",
    },
    {
      id: 6,
      title: "The Future of Online Learning Platforms",
      excerpt: "An analysis of trends and predictions for how digital learning environments will evolve in the coming years.",
      category: "Educational Technology",
      author: "Emma Johnson",
      date: "April 5, 2024",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1610484826967-09c5720778c7?q=80&w=1972&auto=format&fit=crop",
    },
  ];

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = activeCategory === "All" || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <PageHeader
        title="Manetho Blog"
        description="Insights, tips, and resources to enhance your learning journey"
      />

      <div className="mb-12">
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

          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="search"
              className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-600 text-sm dark:text-gray-300 dark:placeholder-gray-500"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100">
                      {post.category}
                    </span>
                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      {post.readTime}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex justify-between items-center mt-6">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <User className="w-4 h-4 mr-1" />
                      {post.author}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {post.date}
                    </div>
                  </div>
                  <Button
                    variant="link"
                    className="px-0 mt-4 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300"
                  >
                    Read More <span className="ml-1">→</span>
                  </Button>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No articles found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search or filter to find what you&apos;re looking for
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-xl p-8 text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Subscribe to Our Newsletter
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
          Get the latest educational insights, study tips, and updates delivered straight to your inbox.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Your email address"
            className="flex-grow px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-600"
          />
          <Button className="whitespace-nowrap">
            Subscribe
          </Button>
        </div>
      </div>
    </>
  );
} 
"use client";

import { useState } from "react";
import { Search, Calendar, User, Clock, ArrowRight } from "lucide-react";
import { Button } from "../../../../components/ui/Button";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  coverImage: string;
  author: string;
  authorImage: string;
  date: string;
  readTime: string;
  slug: string;
  featured?: boolean;
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Mastering Complex Concepts with AI-Powered Doubt Solving",
    excerpt: "Discover how AI can help you understand difficult academic concepts faster and more effectively than traditional methods.",
    category: "Learning Tips",
    coverImage: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
    author: "Dr. Sarah Chen",
    authorImage: "https://randomuser.me/api/portraits/women/32.jpg",
    date: "June 10, 2025",
    readTime: "6 min read",
    slug: "mastering-complex-concepts-with-ai",
    featured: true
  },
  {
    id: 2,
    title: "The Science Behind Effective Group Study Sessions",
    excerpt: "Learn the research-backed methods to make your group study sessions more productive and engaging for everyone involved.",
    category: "Collaboration",
    coverImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1032&q=80",
    author: "Prof. James Wilson",
    authorImage: "https://randomuser.me/api/portraits/men/42.jpg",
    date: "May 28, 2025",
    readTime: "8 min read",
    slug: "science-behind-effective-group-study",
    featured: true
  },
  {
    id: 3,
    title: "How to Create a Perfect Study Schedule That You'll Actually Follow",
    excerpt: "Tips and strategies for creating a realistic study schedule that works with your lifestyle and learning preferences.",
    category: "Productivity",
    coverImage: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1168&q=80",
    author: "Emma Rodriguez",
    authorImage: "https://randomuser.me/api/portraits/women/45.jpg",
    date: "May 15, 2025",
    readTime: "5 min read",
    slug: "perfect-study-schedule"
  },
  {
    id: 4,
    title: "The Best Digital Tools for Visual Learners",
    excerpt: "A comprehensive guide to apps and platforms that cater specifically to students who learn best through visual methods.",
    category: "Tools",
    coverImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    author: "Michael Chang",
    authorImage: "https://randomuser.me/api/portraits/men/22.jpg",
    date: "May 5, 2025",
    readTime: "7 min read",
    slug: "digital-tools-visual-learners"
  },
  {
    id: 5,
    title: "Memory Techniques That Actually Work for Students",
    excerpt: "Science-backed memory techniques and mnemonic devices that can help you retain information for exams and beyond.",
    category: "Learning Tips",
    coverImage: "https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1168&q=80",
    author: "Dr. Robert Kim",
    authorImage: "https://randomuser.me/api/portraits/men/67.jpg",
    date: "April 22, 2025",
    readTime: "9 min read",
    slug: "memory-techniques-for-students"
  },
  {
    id: 6,
    title: "Overcoming Math Anxiety: A Step-by-Step Guide",
    excerpt: "Practical strategies to help students overcome fear and anxiety related to mathematics and build confidence.",
    category: "Psychology",
    coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    author: "Dr. Lisa Johnson",
    authorImage: "https://randomuser.me/api/portraits/women/65.jpg",
    date: "April 15, 2025",
    readTime: "7 min read",
    slug: "overcoming-math-anxiety"
  }
];

const categories = ["All", "Learning Tips", "Collaboration", "Productivity", "Tools", "Psychology"];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const featuredPosts = blogPosts.filter(post => post.featured);

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">Manetho Blog</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Insights, tips, and strategies to help you excel in your academic journey
        </p>
      </div>

      {/* Featured Posts */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Featured Articles</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {featuredPosts.map(post => (
            <div key={post.id} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="h-60 overflow-hidden">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <span className="inline-block px-3 py-1 text-xs font-medium bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 rounded-full mb-4">
                  {post.category}
                </span>
                <h3 className="text-xl font-bold mb-3 dark:text-white">{post.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={post.authorImage}
                      alt={post.author}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{post.author}</span>
                  </div>
                  <Button
                    variant="link"
                    href={`/blog/${post.slug}`}
                    className="text-cyan-600 dark:text-cyan-400 flex items-center gap-1"
                  >
                    Read more <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-200"
            placeholder="Search articles..."
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                  ? 'bg-cyan-600 text-white dark:bg-cyan-700'
                  : 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Posts Grid */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Recent Articles</h2>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl">
            <p className="text-lg text-gray-600 dark:text-gray-400">No articles found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map(post => (
              <div key={post.id} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="h-48 overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 rounded-full mb-3">
                    {post.category}
                  </span>
                  <h3 className="text-lg font-bold mb-2 dark:text-white">{post.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3 gap-4">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {post.date}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {post.readTime}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img
                        src={post.authorImage}
                        alt={post.author}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{post.author}</span>
                    </div>
                    <Button
                      variant="link"
                      href={`/blog/${post.slug}`}
                      className="text-xs text-cyan-600 dark:text-cyan-400"
                    >
                      Read more
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Newsletter Subscription */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-700 dark:to-blue-800 rounded-xl p-8 md:p-12 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">Subscribe to Our Newsletter</h3>
          <p className="text-white/90 mb-6">Get the latest articles, learning tips, and exclusive offers delivered directly to your inbox.</p>
          <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="px-4 py-3 rounded-lg flex-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <Button className="px-6 py-3 bg-white text-cyan-700 hover:bg-gray-100">
              Subscribe
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 
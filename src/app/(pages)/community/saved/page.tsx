"use client";

import { useState, useEffect } from "react";
import { Heart, MessageCircle, Clock, Bookmark, ChevronLeft, Image as ImageIcon, BarChart3, ExternalLink, Filter, Search, TrendingUp, Users } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useTheme } from '@/components/theme/ThemeProvider';

interface SavedPost {
  threadId: string;
  title: string;
  content: string;
  category: string;
  author: string;
  authorId?: string;
  authorImage: string;
  createdAt: string;
  savedAt: string;
  likeCount: number;
  commentCount: number;
  viewCount?: number;
  isPinned?: boolean;
  isLocked?: boolean;
  postType?: string;
  images?: string[];
  pollOptions?: string[];
  pollVotes?: Record<string, unknown>;
}

export default function SavedPostsPage() {
  const { user } = useUser();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterCategory, setFilterCategory] = useState("all");

  // Full post modal state
  const [showFullPostModal, setShowFullPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SavedPost | null>(null);

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/community/saved-posts');
      if (!response.ok) {
        throw new Error('Failed to fetch saved posts');
      }
      const data = await response.json();
      setSavedPosts(data.savedPosts || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching saved posts:', err);
      setError('Failed to load saved posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsavePost = async (threadId: string) => {
    try {
      const response = await fetch('/api/community/saved-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threadId,
          action: 'unsave'
        }),
      });

      if (response.ok) {
        setSavedPosts(prev => prev.filter(post => post.threadId !== threadId));
      }
    } catch (error) {
      console.error('Error unsaving post:', error);
    }
  };

  const handleProfileClick = (authorId?: string, authorName?: string) => {
    if (authorId && authorId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      router.push(`/profile/${authorId}`);
    } else {
      console.log('Invalid user ID or missing authorId for:', authorName);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  const formatSavedTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return `Saved ${formatTime(timestamp)}`;
  };

  // Filter and sort posts
  const filteredPosts = savedPosts
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || post.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
        case 'oldest':
          return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
        case 'popular':
          return (b.likeCount + b.commentCount) - (a.likeCount + a.commentCount);
        default:
          return 0;
      }
    });

  // Calculate statistics
  const totalPosts = savedPosts.length;
  const totalLikes = savedPosts.reduce((sum, post) => sum + post.likeCount, 0);
  const totalComments = savedPosts.reduce((sum, post) => sum + post.commentCount, 0);
  const categories = Array.from(new Set(savedPosts.map(post => post.category)));
  const authors = Array.from(new Set(savedPosts.map(post => post.author)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200/30 dark:border-slate-700/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back Arrow + Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/community')}
                className="p-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-xl transition-all duration-200"
                title="Back to Community"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Bookmark className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Saved Posts</h1>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    {totalPosts} {totalPosts === 1 ? 'post' : 'posts'} saved for later reading
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2.5 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-xl transition-all duration-200"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {/* Left Sidebar - Stats & Filters */}
            <div className="w-80 space-y-6 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin">
              {/* Statistics Card */}
              <div className="bg-gradient-to-br from-white/80 to-gray-100/80 dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur rounded-2xl p-6 border border-gray-200/30 dark:border-slate-700/30 shadow-xl">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-500" />
                  Statistics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bookmark className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-gray-600 dark:text-slate-400">Total Saved</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{totalPosts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-gray-600 dark:text-slate-400">Total Likes</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{totalLikes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-slate-400">Total Comments</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{totalComments}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600 dark:text-slate-400">Authors</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{authors.length}</span>
                  </div>
                </div>
              </div>

              {/* Search & Filters */}
              <div className="bg-gradient-to-br from-white/80 to-gray-100/80 dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur rounded-2xl p-6 border border-gray-200/30 dark:border-slate-700/30 shadow-xl">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-500" />
                  Filters
                </h3>

                {/* Search */}
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search saved posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200/30 dark:border-slate-700/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200/30 dark:border-slate-700/30 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    >
                      <option value="recent">Recently Saved</option>
                      <option value="oldest">Oldest First</option>
                      <option value="popular">Most Popular</option>
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Category</label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200/30 dark:border-slate-700/30 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category} className="capitalize">
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-white/80 to-gray-100/80 dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur rounded-2xl p-6 border border-gray-200/30 dark:border-slate-700/30 shadow-xl">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/community')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all duration-200 text-left"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium">Explore New Posts</span>
                  </button>
                  <button
                    onClick={fetchSavedPosts}
                    className="w-full flex items-center gap-3 px-4 py-3 text-green-600 dark:text-green-400 hover:bg-green-500/10 rounded-xl transition-all duration-200 text-left"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="font-medium">Refresh Saved Posts</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 max-w-4xl">
              {/* Results Header */}
              <div className="bg-gradient-to-br from-white/60 to-gray-100/60 dark:from-slate-900/60 dark:to-slate-800/60 backdrop-blur rounded-2xl p-6 border border-gray-200/30 dark:border-slate-700/30 shadow-xl mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {searchQuery ? 'Search Results' : 'Your Saved Posts'}
                    </h2>
                    <p className="text-gray-600 dark:text-slate-400">
                      {searchQuery && `Showing ${filteredPosts.length} of ${totalPosts} posts matching "${searchQuery}"`}
                      {!searchQuery && `${filteredPosts.length} posts saved for later reading`}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Bookmark className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Posts */}
              <div className="space-y-6">
                {loading ? (
                  <div className="text-center py-16">
                    <div className="relative mx-auto w-12 h-12 mb-4">
                      <div className="absolute inset-0 animate-spin rounded-full border-4 border-gray-300 dark:border-slate-700"></div>
                      <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-amber-500"></div>
                    </div>
                    <p className="text-gray-600 dark:text-slate-400 font-medium">Loading saved posts...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-16">
                    <div className="p-6 rounded-xl bg-red-900/20 max-w-sm mx-auto">
                      <p className="text-red-400 mb-4 font-medium">{error}</p>
                      <button
                        onClick={fetchSavedPosts}
                        className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                ) : filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <article key={post.threadId} className="group bg-gradient-to-br from-white/60 to-gray-100/60 dark:from-slate-900/40 dark:to-slate-800/40 backdrop-blur rounded-xl overflow-hidden transition-all duration-300 hover:bg-gray-200/60 dark:hover:bg-slate-800/50 border border-gray-200/30 dark:border-slate-700/30 shadow-lg hover:shadow-xl">
                      <div className="p-6">
                        {/* Saved Badge */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full">
                            <Bookmark className="w-3 h-3 fill-current" />
                            <span>{formatSavedTime(post.savedAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedPost(post);
                                setShowFullPostModal(true);
                              }}
                              className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                              title="View full post"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleUnsavePost(post.threadId)}
                              className="text-xs text-gray-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors px-3 py-1.5 hover:bg-red-500/10 rounded-full"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Post Header */}
                        <div className="flex items-center gap-3 mb-4">
                          <button
                            onClick={() => handleProfileClick(post.authorId, post.author)}
                            className="relative hover:scale-110 transition-transform duration-300"
                          >
                            <img
                              src={post.authorImage}
                              alt={post.author}
                              className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-700/50 hover:ring-blue-500/50 transition-all duration-300"
                            />
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                          </button>
                          <div className="flex-1">
                            <button
                              onClick={() => handleProfileClick(post.authorId, post.author)}
                              className="font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left block"
                            >
                              {post.author}
                            </button>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                              <Clock className="w-3 h-3" />
                              <span>Posted {formatTime(post.createdAt)}</span>
                              <span>•</span>
                              <span className="capitalize bg-gray-500/10 px-2 py-0.5 rounded">{post.category}</span>
                            </div>
                          </div>
                        </div>

                        {/* Post Content */}
                        <div className="mb-6">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                            {post.title}
                          </h3>
                          <p className="text-gray-700 dark:text-slate-300 leading-relaxed line-clamp-3">
                            {post.content}
                          </p>

                          {/* Post Images */}
                          {post.images && post.images.length > 0 && (
                            <div className="mt-4">
                              {post.images.length === 1 ? (
                                <div className="w-full max-w-lg mx-auto">
                                  <div className="relative group overflow-hidden rounded-2xl bg-gray-100 dark:bg-slate-800/50">
                                    {/* Consistent Instagram-style container */}
                                    <div className="aspect-[4/5] w-full">
                                      <img
                                        src={post.images[0]}
                                        alt="Post image"
                                        className="w-full h-full transition-all duration-500 cursor-pointer group-hover:scale-110 group-hover:brightness-110"
                                        onClick={() => window.open(post.images![0], '_blank')}
                                        style={{
                                          objectFit: 'cover',
                                          objectPosition: 'center'
                                        }}
                                        onLoad={(e) => {
                                          const img = e.target as HTMLImageElement;
                                          const aspectRatio = img.naturalWidth / img.naturalHeight;

                                          // Smart object positioning based on aspect ratio
                                          if (aspectRatio > 2) {
                                            // Wide/panoramic images - focus on center
                                            img.style.objectPosition = 'center';
                                            img.style.objectFit = 'cover';
                                          } else if (aspectRatio < 0.6) {
                                            // Very tall/portrait images - focus on top
                                            img.style.objectPosition = 'center 20%';
                                            img.style.objectFit = 'cover';
                                          } else if (aspectRatio < 0.8) {
                                            // Portrait images - slight top focus
                                            img.style.objectPosition = 'center 30%';
                                            img.style.objectFit = 'cover';
                                          } else if (aspectRatio > 1.8) {
                                            // Landscape images - center focus
                                            img.style.objectPosition = 'center';
                                            img.style.objectFit = 'cover';
                                          } else {
                                            // Square-ish images - perfect center
                                            img.style.objectPosition = 'center';
                                            img.style.objectFit = 'cover';
                                          }
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ) : post.images.length === 2 ? (
                                <div className="grid grid-cols-2 gap-2 max-w-lg mx-auto">
                                  {post.images.map((image, index) => (
                                    <div key={index} className="relative group overflow-hidden rounded-xl bg-gray-100 dark:bg-slate-800/50">
                                      <div className="aspect-square w-full">
                                        <img
                                          src={image}
                                          alt={`Post image ${index + 1}`}
                                          className="w-full h-full object-cover transition-all duration-500 cursor-pointer group-hover:scale-105 group-hover:brightness-110"
                                          onClick={() => window.open(image, '_blank')}
                                          onLoad={(e) => {
                                            const img = e.target as HTMLImageElement;
                                            const aspectRatio = img.naturalWidth / img.naturalHeight;

                                            // Optimize cropping for square containers
                                            if (aspectRatio > 1.5) {
                                              img.style.objectPosition = 'center';
                                            } else if (aspectRatio < 0.7) {
                                              img.style.objectPosition = 'center 25%';
                                            } else {
                                              img.style.objectPosition = 'center';
                                            }
                                          }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : post.images.length === 3 ? (
                                <div className="max-w-lg mx-auto">
                                  <div className="grid grid-cols-2 gap-2 h-80">
                                    {/* Main image - larger */}
                                    <div className="relative group overflow-hidden rounded-xl bg-gray-100 dark:bg-slate-800/50 row-span-2">
                                      <img
                                        src={post.images[0]}
                                        alt="Post image 1"
                                        className="w-full h-full object-cover transition-all duration-500 cursor-pointer group-hover:scale-105 group-hover:brightness-110"
                                        onClick={() => window.open(post.images[0], '_blank')}
                                        onLoad={(e) => {
                                          const img = e.target as HTMLImageElement;
                                          const aspectRatio = img.naturalWidth / img.naturalHeight;

                                          if (aspectRatio > 1.5) {
                                            img.style.objectPosition = 'center';
                                          } else if (aspectRatio < 0.8) {
                                            img.style.objectPosition = 'center 30%';
                                          } else {
                                            img.style.objectPosition = 'center';
                                          }
                                        }}
                                      />
                                    </div>

                                    {/* Secondary images - smaller */}
                                    <div className="flex flex-col gap-2">
                                      {post.images.slice(1, 3).map((image, index) => (
                                        <div key={index + 1} className="relative group overflow-hidden rounded-xl bg-gray-100 dark:bg-slate-800/50 flex-1">
                                          <img
                                            src={image}
                                            alt={`Post image ${index + 2}`}
                                            className="w-full h-full object-cover transition-all duration-500 cursor-pointer group-hover:scale-105 group-hover:brightness-110"
                                            onClick={() => window.open(image, '_blank')}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 gap-2 max-w-lg mx-auto">
                                  {post.images.slice(0, 4).map((image, index) => (
                                    <div key={index} className="relative group overflow-hidden rounded-xl bg-gray-100 dark:bg-slate-800/50">
                                      <div className="aspect-square w-full">
                                        <img
                                          src={image}
                                          alt={`Post image ${index + 1}`}
                                          className="w-full h-full object-cover transition-all duration-500 cursor-pointer group-hover:scale-105 group-hover:brightness-110"
                                          onClick={() => window.open(image, '_blank')}
                                          onLoad={(e) => {
                                            const img = e.target as HTMLImageElement;
                                            const aspectRatio = img.naturalWidth / img.naturalHeight;

                                            // Smart positioning for grid
                                            if (aspectRatio > 1.8) {
                                              img.style.objectPosition = 'center';
                                            } else if (aspectRatio < 0.6) {
                                              img.style.objectPosition = 'center 20%';
                                            } else {
                                              img.style.objectPosition = 'center';
                                            }
                                          }}
                                        />
                                      </div>
                                      {index === 3 && post.images!.length > 4 && (
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center text-white">
                                          <div className="text-lg font-bold mb-1">+{post.images!.length - 4}</div>
                                          <div className="text-xs opacity-80">more photos</div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Poll Display */}
                          {post.postType === 'poll' && post.pollOptions && (
                            <div className="mt-4 p-4 bg-gray-100/50 dark:bg-slate-800/30 rounded-2xl border border-gray-200/30 dark:border-slate-700/30">
                              <div className="flex items-center gap-2 mb-4">
                                <BarChart3 className="w-5 h-5 text-purple-400" />
                                <span className="text-sm font-medium text-purple-400">Poll</span>
                              </div>
                              <div className="space-y-3">
                                {post.pollOptions.map((option, index) => {
                                  const votes = post.pollVotes || {};
                                  const optionVotes = votes[index] || 0;
                                  const totalVotes = post.pollOptions!.reduce((sum, _, optionIndex) => {
                                    return sum + (votes[optionIndex] || 0);
                                  }, 0);
                                  const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;

                                  return (
                                    <div key={index} className="relative">
                                      <div className="w-full p-3 rounded-xl border bg-gray-100/50 dark:bg-slate-800/50 border-gray-300/30 dark:border-slate-600/30 text-gray-800 dark:text-slate-300">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-slate-700/50 text-gray-600 dark:text-slate-400 flex items-center justify-center text-xs font-medium">
                                              {String.fromCharCode(65 + index)}
                                            </div>
                                            <span className="font-medium">{option}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">{percentage}%</span>
                                            <span className="text-xs text-slate-500">({optionVotes} votes)</span>
                                          </div>
                                        </div>
                                        {totalVotes > 0 && (
                                          <div className="mt-2 w-full bg-gray-300/30 dark:bg-slate-700/30 rounded-full h-1.5">
                                            <div
                                              className="h-1.5 rounded-full bg-gray-500 dark:bg-slate-600 transition-all duration-500"
                                              style={{ width: `${percentage}%` }}
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Post Stats */}
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-slate-500 mb-4 pb-4 border-b border-gray-200/30 dark:border-slate-700/30">
                          <div className="flex items-center gap-4">
                            {post.likeCount > 0 && (
                              <span className="flex items-center gap-1">
                                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                                <span className="text-red-400 font-medium">{post.likeCount}</span>
                              </span>
                            )}
                            {post.commentCount > 0 && (
                              <span className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4" />
                                <span>{post.commentCount} comments</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => router.push(`/community?post=${post.threadId}`)}
                              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>View Post</span>
                            </button>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => router.push(`/community?post=${post.threadId}`)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all duration-300"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>Join Discussion</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUnsavePost(post.threadId)}
                              className="p-2.5 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-xl transition-all duration-300"
                              title="Remove from saved"
                            >
                              <Bookmark className="w-4 h-4 fill-current" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="text-center py-20">
                    <div className="max-w-md mx-auto">
                      <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Bookmark className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        {searchQuery ? 'No matching posts found' : 'No saved posts yet'}
                      </h3>
                      <p className="text-gray-600 dark:text-slate-400 mb-6">
                        {searchQuery ? 'Try adjusting your search terms or filters.' : 'Start saving interesting posts by clicking the bookmark icon on any post!'}
                      </p>
                      <button
                        onClick={() => {
                          if (searchQuery) {
                            setSearchQuery('');
                            setFilterCategory('all');
                          } else {
                            router.push('/community');
                          }
                        }}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
                      >
                        {searchQuery ? 'Clear Filters' : 'Explore Community'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Post Modal */}
      {showFullPostModal && selectedPost && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowFullPostModal(false);
              setSelectedPost(null);
            }
          }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex">
            {/* Left Column - Image */}
            <div className="flex-1 bg-black flex items-center justify-center min-h-[600px]">
              {selectedPost.images && selectedPost.images.length > 0 ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={selectedPost.images[0]}
                    alt="Full size post image"
                    className="max-w-full max-h-full object-contain"
                  />
                  {selectedPost.images.length > 1 && (
                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                      1 of {selectedPost.images.length}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center text-gray-500 dark:text-slate-400">
                  <div className="text-center">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No image available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Post Details */}
            <div className="w-96 flex flex-col bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-700">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedPost.authorImage}
                    alt={selectedPost.author}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                      {selectedPost.author}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {formatTime(selectedPost.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowFullPostModal(false);
                    setSelectedPost(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {/* Saved Badge */}
                  <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full w-fit">
                    <Bookmark className="w-3 h-3 fill-current" />
                    <span>{formatSavedTime(selectedPost.savedAt)}</span>
                  </div>

                  {/* Post Title and Content */}
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                      {selectedPost.title}
                    </h2>
                    <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
                      {selectedPost.content}
                    </p>
                  </div>

                  {/* Poll Display */}
                  {selectedPost.postType === 'poll' && selectedPost.pollOptions && (
                    <div className="p-4 bg-gray-100/50 dark:bg-slate-800/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium text-purple-400">Poll</span>
                      </div>
                      <div className="space-y-2">
                        {selectedPost.pollOptions.map((option, index) => {
                          const votes = selectedPost.pollVotes || {};
                          const optionVotes = votes[index] || 0;
                          const totalVotes = selectedPost.pollOptions!.reduce((sum, _, optionIndex) => {
                            return sum + (votes[optionIndex] || 0);
                          }, 0);
                          const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;

                          return (
                            <div key={index} className="flex items-center justify-between p-2 bg-white/50 dark:bg-slate-700/30 rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium bg-gray-200 dark:bg-slate-600 w-5 h-5 rounded-full flex items-center justify-center">
                                  {String.fromCharCode(65 + index)}
                                </span>
                                <span className="text-sm">{option}</span>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-slate-400">
                                {percentage}% ({optionVotes})
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Additional Images */}
                  {selectedPost.images && selectedPost.images.length > 1 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        All Images ({selectedPost.images.length})
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedPost.images.slice(1).map((image, index) => (
                          <div key={index + 1} className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800">
                            <img
                              src={image}
                              alt={`Post image ${index + 2}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                              onClick={() => window.open(image, '_blank')}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer - Stats and Actions */}
              <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-slate-500 mb-3">
                  <div className="flex items-center gap-4">
                    {selectedPost.likeCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                        <span className="text-red-400 font-medium">{selectedPost.likeCount}</span>
                      </span>
                    )}
                    {selectedPost.commentCount > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{selectedPost.commentCount} comments</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => router.push(`/community?post=${selectedPost.threadId}`)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all duration-300"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Join Discussion</span>
                  </button>

                  <button
                    onClick={() => handleUnsavePost(selectedPost.threadId)}
                    className="p-2 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all duration-300"
                    title="Remove from saved"
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
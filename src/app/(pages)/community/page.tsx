"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Star, MessageCircle, User, ThumbsUp, Clock, Filter, Trash2, Plus, X, Image, Smile } from "lucide-react";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import ContentCard from "@/components/ui/ContentCard";
import { useUser } from "@clerk/nextjs";

interface Comment {
  id: string;
  author: string;
  authorImage: string;
  content: string;
  timeAgo: string;
  likes: number;
  parentCommentId?: string;
}

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  authorImage: string;
  date: string;
  timeAgo: string;
  stars: number;
  comments: number;
  userStarred: boolean;
  commentsList: Comment[];
  isPinned?: boolean;
  isLocked?: boolean;
  viewCount?: number;
}

export default function CommunityPage() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    "All",
    "Study Tips",
    "Questions",
    "Resources",
    "Study Groups",
    "Success Stories",
  ];

  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("recent");

  // Sync user and fetch posts from API
  useEffect(() => {
    const syncUserAndFetchPosts = async () => {
      if (user) {
        try {
          // Sync user with database first
          await fetch('/api/auth/sync-user', {
            method: 'POST',
          });
        } catch (error) {
          console.error('Error syncing user:', error);
        }
      }
      fetchPosts();
    };

    syncUserAndFetchPosts();
  }, [searchQuery, activeCategory, sortBy, user]);

  // Handle escape key to close modal
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && showCreatePostModal) {
      setShowCreatePostModal(false);
    }
  }, [showCreatePostModal]);

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [handleEscapeKey]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchQuery,
        category: activeCategory,
        sortBy: sortBy,
      });

      const response = await fetch(`/api/community/threads?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      setCommunityPosts(data.threads || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle starring a post
  const handleStarPost = async (postId: string) => {
    try {
      const post = communityPosts.find(p => p.id === postId);
      if (!post) return;

      const response = await fetch(`/api/community/threads/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isLiked: !post.userStarred,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }

      const data = await response.json();

      setCommunityPosts(communityPosts.map(p => {
        if (p.id === postId) {
        return {
            ...p,
            userStarred: data.isLiked,
            stars: data.likeCount
        };
      }
        return p;
    }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Handle adding a new post
  const handleAddPost = async () => {
    if (newPostTitle.trim() === "" || newPostContent.trim() === "" || isCreatingPost) return;

    setIsCreatingPost(true);
    try {
      const response = await fetch('/api/community/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
      title: newPostTitle,
      content: newPostContent,
      category: activeCategory === "All" ? "Questions" : activeCategory,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const newPost = await response.json();
    setCommunityPosts([newPost, ...communityPosts]);
    setNewPostTitle("");
    setNewPostContent("");
      setShowCreatePostModal(false);
      // Reset to "All" category after posting
      setActiveCategory("All");
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsCreatingPost(false);
    }
  };

  // Handle adding a comment
  const handleAddComment = async (postId: string, commentText: string) => {
    if (!commentText.trim()) return;

    try {
      const response = await fetch(`/api/community/threads/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: commentText,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const newComment = await response.json();

      setCommunityPosts(communityPosts.map(post => {
        if (post.id === postId) {
        return {
          ...post,
          comments: post.comments + 1,
          commentsList: [...post.commentsList, newComment]
        };
      }
      return post;
    }));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Handle deleting a post
  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/community/threads/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      setCommunityPosts(communityPosts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post. Please try again.');
    }
  };

  return (
    <>
      <PageHeader
        title="Join Our Community"
        description="Connect with fellow learners, share study tips, and get help with your questions"
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

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="search"
                className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-600 text-sm dark:text-gray-300 dark:placeholder-gray-500"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="relative">
              <select
                className="h-full pl-3 pr-10 py-2 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 text-sm text-gray-700 dark:text-gray-300 appearance-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="mostComments">Most Comments</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <Filter className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          {/* Quick Post Creator */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
            <div className="flex items-center gap-3">
              <img
                src={user?.imageUrl || "https://i.pravatar.cc/150?img=12"}
                alt="Your avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <button
                onClick={() => setShowCreatePostModal(true)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full px-4 py-3 text-left text-gray-500 dark:text-gray-400 transition-colors"
              >
                What's on your mind, {user?.firstName || 'there'}?
              </button>
                <Button
                onClick={() => setShowCreatePostModal(true)}
                size="sm"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                >
                <Plus className="w-4 h-4 mr-1" />
                  Post
                </Button>
              </div>
            </div>
        </div>

        <div className="space-y-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading posts...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button onClick={fetchPosts}>Try Again</Button>
            </div>
          ) : communityPosts.length > 0 ? (
            communityPosts.map((post) => (
              <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4">
                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                    <img
                      src={post.authorImage}
                      alt={post.author}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{post.author}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{post.timeAgo}</span>
                          <span>•</span>
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100">
                            {post.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    {user?.fullName === post.author && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        title="Delete post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {post.title}
                  </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {post.content}
                  </p>
                  </div>

                  {/* Post Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-4">
                      {post.stars > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                          {post.stars}
                        </span>
                      )}
                    </div>
                    {post.comments > 0 && (
                      <span>{post.comments} comment{post.comments !== 1 ? 's' : ''}</span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center border-t border-gray-200 dark:border-gray-700 pt-3">
                    <button
                      onClick={() => handleStarPost(post.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${post.userStarred
                        ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                    >
                      <Star className={`w-4 h-4 ${post.userStarred ? "fill-current" : ""}`} />
                      <span>{post.userStarred ? 'Starred' : 'Star'}</span>
                    </button>

                    <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span>Comment</span>
                    </button>
                  </div>

                  {/* Comments section */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {post.commentsList.length > 0 && (
                      <div className="space-y-3 mb-4">
                    {post.commentsList.map((comment) => (
                          <div key={comment.id} className="flex items-start gap-3">
                        <img
                          src={comment.authorImage}
                          alt={comment.author}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                            <div className="flex-1 min-w-0">
                              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {comment.author}
                            </h5>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                  {comment.content}
                                </p>
                              </div>
                              <div className="flex items-center gap-4 mt-1 ml-4">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {comment.timeAgo}
                            </span>
                            <button className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                              <ThumbsUp className="w-3 h-3" />
                                  {comment.likes > 0 && <span>{comment.likes}</span>}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                      </div>
                    )}

                    {/* Comment form */}
                    <div className="flex items-start gap-3">
                      <img
                        src={user?.imageUrl || "https://i.pravatar.cc/150?img=12"}
                        alt="You"
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <AddCommentForm postId={post.id} onAddComment={handleAddComment} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <MessageCircle className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No posts found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search or filter to find what you're looking for
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePostModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreatePostModal(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Post</h2>
              <button
                onClick={() => setShowCreatePostModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* User Info */}
              <div className="flex items-center gap-3 mb-6">
                <img
                  src={user?.imageUrl || "https://i.pravatar.cc/150?img=12"}
                  alt="Your avatar"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {user?.fullName || user?.firstName || 'Anonymous'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <select
                      className="text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-gray-700 dark:text-gray-300"
                      value={activeCategory === "All" ? "Questions" : activeCategory}
                      onChange={(e) => setActiveCategory(e.target.value)}
                    >
                      {categories.filter(cat => cat !== "All").map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Post Title */}
              <div className="mb-4">
                <input
                  type="text"
                  className="w-full px-0 py-2 text-xl font-medium bg-transparent border-0 border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-cyan-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="What's the title of your post?"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
              </div>

              {/* Post Content */}
              <div className="mb-6">
                <textarea
                  className="w-full px-0 py-2 bg-transparent border-0 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none min-h-[200px]"
                  placeholder="Share your thoughts, questions, or resources..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  maxLength={2000}
                />
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <span></span>
                  <span className={newPostContent.length > 1800 ? 'text-orange-500' : newPostContent.length > 1900 ? 'text-red-500' : ''}>
                    {newPostContent.length}/2000
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <Image className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <Smile className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreatePostModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddPost}
                    disabled={!newPostTitle.trim() || !newPostContent.trim() || isCreatingPost}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  >
                    {isCreatingPost ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Posting...
                      </div>
                    ) : (
                      'Post'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Comment form component
interface AddCommentFormProps {
  postId: string;
  onAddComment: (postId: string, comment: string) => void;
}

function AddCommentForm({ postId, onAddComment }: AddCommentFormProps) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(postId, comment);
    setComment("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
        <input
          type="text"
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 pr-12"
            placeholder="Write a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSubmitting}
        />
          {comment.trim() && (
            <button
          type="submit"
              disabled={isSubmitting}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-cyan-600 hover:text-cyan-700 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </form>
  );
} 
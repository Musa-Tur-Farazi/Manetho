"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart, MessageCircle, User, Share, Clock, Trash2, Plus, X, Image as ImageIcon, Bookmark, Send, Users, BarChart3, Moon, Sun, Move, ExternalLink, ChevronDown, UserPlus, Search } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import ChatSidebar from "@/components/ChatSidebar";
import { useRouter } from "next/navigation";
import { useFileUpload } from '@/hooks/useFileUpload';
import { useTheme } from '@/components/theme/ThemeProvider';
import NotificationBell from "@/components/NotificationBell";

interface Comment {
  id: string;
  author: string;
  authorId?: string;
  authorImage: string;
  content: string;
  timeAgo: string;
  likes: number;
  parentCommentId?: string;
}

interface CommunityPost {
  id: string;
  content: string;
  author: string;
  authorId?: string;
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
  postType?: string;
  images?: string[];
  pollOptions?: string[];
  pollVotes?: Record<string, unknown>;
}

export default function CommunityPage() {
  const { user } = useUser();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [postType, setPostType] = useState<"text" | "photo" | "poll">("text");
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");


  // File upload hook for Appwrite integration
  const { uploadFile, uploading, error: uploadError } = useFileUpload();

  const [searchQuery, setSearchQuery] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [uploadingFileIndex, setUploadingFileIndex] = useState(0);
  const [imagePositions, setImagePositions] = useState<Record<number, { x: number; y: number }>>({});
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [pollQuestion, setPollQuestion] = useState('');
  const [shareDropdownOpen, setShareDropdownOpen] = useState<string | null>(null);
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());
  const [showFullPostModal, setShowFullPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  // Sync user and fetch posts from API
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchQuery,
        sortBy: sortBy,
      });

      console.log('Fetching posts with params:', searchQuery, sortBy);
      const response = await fetch(`/api/community/threads?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      setPosts(data.threads || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortBy]);

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
  }, [fetchPosts, user]);

  // Fetch saved posts IDs
  useEffect(() => {
    if (user) {
      fetchSavedPosts();
    }
  }, [user]);

  const fetchSavedPosts = async () => {
    try {
      const response = await fetch('/api/community/saved-posts');
      if (response.ok) {
        const data = await response.json();
        const savedIds = new Set(data.savedPosts.map((post: { threadId: string }) => post.threadId as string)) as Set<string>;
        setSavedPostIds(savedIds);
      }
    } catch (error) {
      console.error('Error fetching saved posts:', error);
    }
  };

  // Handle saving/unsaving posts
  const handleSavePost = async (threadId: string) => {
    try {
      const isSaved = savedPostIds.has(threadId);
      const action = isSaved ? 'unsave' : 'save';

      // Optimistic update
      setSavedPostIds(prev => {
        const newSet = new Set(prev);
        if (isSaved) {
          newSet.delete(threadId);
        } else {
          newSet.add(threadId);
        }
        return newSet;
      });

      const response = await fetch('/api/community/saved-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threadId,
          action
        }),
      });

      if (!response.ok) {
        // Revert optimistic update
        setSavedPostIds(prev => {
          const newSet = new Set(prev);
          if (isSaved) {
            newSet.add(threadId);
          } else {
            newSet.delete(threadId);
          }
          return newSet;
        });
        throw new Error('Failed to save/unsave post');
      }

      // Show success message
      const message = isSaved ? 'Post removed from saved' : 'Post saved successfully';
      // You could show a toast notification here
      console.log(message);

    } catch (error) {
      console.error('Error saving/unsaving post:', error);
      setError('Failed to save post. Please try again.');
    }
  };



  // Handle escape key to close modal
  const resetModalState = useCallback(() => {
    // Clean up image previews
    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setSelectedImages([]);
    setImagePreviewUrls([]);
    setUploadingFileIndex(0);
    setImagePositions({});
    setEditingImageIndex(null);
    setNewPostContent('');
    setPollQuestion('');
    setPollOptions(['', '']);
    setPostType('text');
    setError(null); // Clear any errors
  }, [imagePreviewUrls]);

  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && showCreatePostModal) {
      setShowCreatePostModal(false);
      resetModalState();
    }
  }, [showCreatePostModal, resetModalState]);

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [handleEscapeKey]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.share-dropdown-container')) {
        setShareDropdownOpen(null);
      }
    };

    if (shareDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [shareDropdownOpen]);

  // Handle starring a post with animation
  const handleStarPost = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      // Optimistic update for better UX
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            userStarred: !p.userStarred,
            stars: p.userStarred ? p.stars - 1 : p.stars + 1
          };
        }
        return p;
      }));

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
        // Revert optimistic update if failed
        setPosts(posts.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              userStarred: post.userStarred,
              stars: post.stars
            };
          }
          return p;
        }));
        throw new Error('Failed to toggle like');
      }

      const data = await response.json();

      // Update with actual server response
      setPosts(posts.map(p => {
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

  // Toggle comments visibility
  const toggleComments = (postId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedComments(newExpanded);
  };

  // Handle adding a new post
  const handleAddPost = async () => {
    // Validation for different post types
    if (postType === 'text') {
      if (newPostContent.trim() === "" || isCreatingPost) return;
    } else if (postType === 'poll') {
      if (pollQuestion.trim() === "" || isCreatingPost) return;
      const validOptions = pollOptions.filter(option => option.trim() !== '');
      if (validOptions.length < 2) {
        setError('Poll must have at least 2 options');
        return;
      }
    }

    setIsCreatingPost(true);
    try {
      let finalImageUrls: string[] = [];

      // Upload images to Appwrite if there are any selected
      if (selectedImages.length > 0) {
        console.log('Uploading images to Appwrite...');

        const imageUrls: string[] = [];

        // Upload files one by one using the uploadFile function
        for (let i = 0; i < selectedImages.length; i++) {
          setUploadingFileIndex(i + 1);
          const file = selectedImages[i];
          console.log(`Uploading file ${i + 1}/${selectedImages.length}: ${file.name}, size: ${file.size}, type: ${file.type}`);

          try {
            const uploadedFile = await uploadFile(file);

            if (uploadedFile && uploadedFile.url) {
              imageUrls.push(uploadedFile.url);
              console.log(`File ${i + 1} uploaded successfully: ${uploadedFile.url}`);
            } else {
              console.error(`Upload failed for file: ${file.name}`, { uploadedFile });
              throw new Error(`Failed to upload file: ${file.name}. ${uploadError || 'Unknown error occurred.'}`);
            }
          } catch (uploadErr) {
            console.error(`Error uploading file ${file.name}:`, uploadErr);
            throw new Error(`Failed to upload file: ${file.name}. ${uploadErr instanceof Error ? uploadErr.message : 'Unknown error occurred.'}`);
          }
        }

        finalImageUrls = imageUrls;
        setUploadingFileIndex(0); // Reset counter
        console.log('All images uploaded successfully:', finalImageUrls);
      }

      const requestBody: {
        postType: string;
        content?: string;
        images?: string[];
        pollOptions?: string[];
      } = {
        postType,
      };

      if (postType === 'text') {
        requestBody.content = newPostContent;
        if (finalImageUrls.length > 0) {
          requestBody.images = finalImageUrls;
        }
      } else if (postType === 'poll') {
        requestBody.content = pollQuestion;
        requestBody.pollOptions = pollOptions.filter(option => option.trim() !== '');
      }

      const response = await fetch('/api/community/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const newPost = await response.json();
      setPosts([newPost, ...posts]);
      setShowCreatePostModal(false);
      resetModalState();
    } catch (error) {
      console.error('Error creating post:', error);
      setError(`Failed to create post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreatingPost(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalImages = selectedImages.length + newFiles.length;

    if (totalImages > 4) {
      setError('Maximum 4 images allowed per post');
      return;
    }

    // Create preview URLs
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));

    setSelectedImages(prev => [...prev, ...newFiles]);
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  // Remove image
  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviewUrls[index]); // Clean up memory
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));

    // Clean up positioning state and adjust indices
    setImagePositions(prev => {
      const newPositions: Record<number, { x: number; y: number }> = {};
      Object.entries(prev).forEach(([key, value]) => {
        const originalIndex = parseInt(key);
        if (originalIndex < index) {
          newPositions[originalIndex] = value;
        } else if (originalIndex > index) {
          newPositions[originalIndex - 1] = value;
        }
        // Skip the removed index
      });
      return newPositions;
    });

    // Reset editing index if it was the removed image
    if (editingImageIndex === index) {
      setEditingImageIndex(null);
    } else if (editingImageIndex !== null && editingImageIndex > index) {
      setEditingImageIndex(editingImageIndex - 1);
    }
  };

  // Handle image positioning
  const updateImagePosition = (index: number, x: number, y: number) => {
    setImagePositions(prev => ({
      ...prev,
      [index]: { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
    }));
  };

  // Get image style with positioning
  const getImageStyle = (index: number) => {
    const position = imagePositions[index] || { x: 50, y: 50 }; // Default center
    return {
      objectPosition: `${position.x}% ${position.y}%`
    };
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

      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            commentsList: [newComment, ...post.commentsList],
            comments: post.comments + 1
          };
        }
        return post;
      }));

      // Ensure comments are expanded after adding
      setExpandedComments(prev => new Set(prev).add(postId));
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment');
    }
  };

  // Handle deleting a post
  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/community/threads/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      setPosts(posts.filter(post => post.id !== postId));

      // Close modal and reset state
      setShowDeleteModal(false);
      setPostToDelete(null);
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post');
    }
  };

  // Function to handle profile navigation
  const handleProfileClick = (authorId?: string, authorName?: string) => {
    if (authorId && authorId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      router.push(`/profile/${authorId}`);
    } else {
      // Show error or search for user by name
      console.log('Invalid user ID or missing authorId for:', authorName);
      // Could implement a user search page here in the future
    }
  };

  // Add poll option
  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, '']);
    }
  };

  // Remove poll option
  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  // Update poll option
  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  // Handle poll voting
  const handleVotePoll = async (postId: string, optionIndex: number) => {
    try {
      // Optimistic update - immediately update UI
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId && post.pollVotes) {
          const updatedVotes = { ...post.pollVotes };

          // Increment vote count for selected option
          updatedVotes[optionIndex] = ((updatedVotes[optionIndex] as number) || 0) + 1;

          // Mark user as voted
          if (!updatedVotes.userVotes) updatedVotes.userVotes = {};
          updatedVotes.userVote = optionIndex;

          return {
            ...post,
            pollVotes: updatedVotes
          };
        }
        return post;
      }));

      const response = await fetch(`/api/community/threads/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          optionIndex,
        }),
      });

      if (!response.ok) {
        // Revert optimistic update if failed
        throw new Error('Failed to vote');
      }

      const data = await response.json();

      // Update with actual server response
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            pollVotes: data.pollVotes
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error voting on poll:', error);
      setError('Failed to vote. Please try again.');

      // Revert optimistic update on error - refetch the posts
      fetchPosts();
    }
  };

  // Share functionality
  const handleShareToTimeline = async (postId: string) => {
    try {
      const response = await fetch('/api/community/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ threadId: postId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to share post');
      }

      setShareDropdownOpen(null);
      // Show success message or toast here if needed
      alert('Post shared to your timeline successfully!');
    } catch (error) {
      console.error('Error sharing post:', error);
      alert('Failed to share post. Please try again.');
    }
  };

  const handleCopyLink = async (postId: string) => {
    try {
      const postUrl = `${window.location.origin}/community?post=${postId}`;
      await navigator.clipboard.writeText(postUrl);
      setShareDropdownOpen(null);
      // Show success message or toast here if needed
      alert('Post link copied to clipboard!');
    } catch (error) {
      console.error('Error copying link:', error);
      alert('Failed to copy link. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 w-full">
      {/* Single Unified Compact Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200/30 dark:border-slate-700/30 shadow-lg">
        {/* Main Navigation Row - More Compact */}
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          {/* Left: Back Arrow + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/home')}
              className="p-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200"
              title="Back to Home"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => router.push('/home')}
              className="text-lg font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent hover:from-indigo-400 hover:to-purple-400 transition-all"
            >
              Manetho
            </button>
          </div>

          {/* Center: Search */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-slate-400" />
              <input
                type="search"
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 text-sm border border-gray-300 dark:border-slate-700/30"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Right: Controls + User */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Notifications */}
            <NotificationBell />

            {/* User Avatar Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800/50 transition-colors">
                <img
                  src={user?.imageUrl || "https://i.pravatar.cc/150?img=12"}
                  alt="Profile"
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-gray-300 dark:ring-slate-700/50 group-hover:ring-blue-500/50 transition-all"
                />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-2">
                  <button
                    onClick={() => router.push(user?.id ? `/profile/${user.id}` : '/profile')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    Profile
                  </button>

                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
                    Settings
                  </button>
                  <hr className="my-2 border-gray-200 dark:border-slate-700/50" />
                  <button className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-6 flex gap-8">
          {/* Left Navigation Sidebar */}
          <div className="hidden lg:block w-64 space-y-4 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin">
            <div className="bg-gradient-to-br from-white/60 to-gray-100/60 dark:from-slate-900/60 dark:to-slate-800/60 backdrop-blur rounded-2xl p-4 border border-gray-200/30 dark:border-slate-700/30 shadow-xl">
              <nav className="space-y-2">
                {/* Feed */}
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-white bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-all duration-200">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                  <span className="font-medium">Feed</span>
                </button>

                {/* Create Group */}
                <button
                  onClick={() => router.push('/group-study?create=true')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Create Group</span>
                </button>

                {/* My Groups */}
                <button
                  onClick={() => router.push('/group-study')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">My Groups</span>
                </button>

                {/* Saved Posts */}
                <button
                  onClick={() => router.push('/community/saved')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                >
                  <Bookmark className="w-5 h-5" />
                  <span className="font-medium">Saved</span>
                </button>

                {/* Popular */}
                <button
                  onClick={() => setSortBy('popular')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium">Popular</span>
                </button>

                {/* Recent */}
                <button
                  onClick={() => setSortBy('recent')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                >
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Recent</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Feed */}
          <div className="flex-1 max-w-xl mx-auto">
            {/* Facebook-Style Create Post Card */}
            <div className="mb-6 bg-gradient-to-br from-white/60 to-gray-100/60 dark:from-slate-900/40 dark:to-slate-800/40 backdrop-blur rounded-xl overflow-hidden transition-all duration-300 hover:bg-gray-200/60 dark:hover:bg-slate-800/50 border border-gray-200/30 dark:border-slate-700/30">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative group">
                    <img
                      src={user?.imageUrl || "https://i.pravatar.cc/150?img=12"}
                      alt="Your avatar"
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-gray-300 dark:ring-slate-700/50 group-hover:ring-blue-500/50 transition-all duration-300"
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                  </div>
                  <button
                    onClick={() => setShowCreatePostModal(true)}
                    className="flex-1 text-left px-4 py-3 bg-gray-100 dark:bg-slate-800/40 hover:bg-gray-200 dark:hover:bg-slate-700/50 rounded-xl text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-300 transition-all duration-300 border border-gray-300 dark:border-slate-700/30 hover:border-gray-400 dark:hover:border-slate-600/50 text-sm"
                  >
                    What&apos;s on your mind, {user?.firstName || 'there'}?
                  </button>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200/30 dark:border-slate-700/30">
                  <button
                    onClick={() => setShowCreatePostModal(true)}
                    className="flex items-center gap-2 px-3 py-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-300 flex-1 justify-center text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="font-medium">Post</span>
                  </button>

                  <div className="w-px h-5 bg-gray-300 dark:bg-slate-700/50 mx-2"></div>

                  <button
                    className="flex items-center gap-2 px-3 py-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all duration-300 flex-1 justify-center text-sm"
                    onClick={() => setShowCreatePostModal(true)}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span className="font-medium">Photo</span>
                  </button>

                  <div className="w-px h-5 bg-gray-300 dark:bg-slate-700/50 mx-2"></div>

                  <button
                    className="flex items-center gap-2 px-3 py-2 text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all duration-300 flex-1 justify-center text-sm"
                    onClick={() => {
                      setPostType('poll');
                      setShowCreatePostModal(true);
                    }}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span className="font-medium">Poll</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-16">
                  <div className="relative mx-auto w-12 h-12 mb-4">
                    <div className="absolute inset-0 animate-spin rounded-full border-4 border-gray-300 dark:border-slate-700"></div>
                    <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-blue-500"></div>
                  </div>
                  <p className="text-gray-600 dark:text-slate-400 font-medium">Loading posts...</p>
                </div>
              ) : error ? (
                <div className="text-center py-16">
                  <div className="p-4 rounded-xl bg-red-900/20 max-w-sm mx-auto">
                    <p className="text-red-400 mb-3 font-medium">{error}</p>
                    <button
                      onClick={fetchPosts}
                      className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <article key={post.id} className="group bg-gradient-to-br from-white/60 to-gray-100/60 dark:from-slate-900/40 dark:to-slate-800/40 backdrop-blur rounded-xl overflow-hidden transition-all duration-300 hover:bg-gray-200/60 dark:hover:bg-slate-800/50 border border-gray-200/30 dark:border-slate-700/30">
                    <div className="p-4">
                      {/* Post Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleProfileClick(post.authorId, post.author)}
                            className="relative hover:scale-110 transition-transform duration-300"
                          >
                            <img
                              src={post.authorImage}
                              alt={post.author}
                              className="w-10 h-10 rounded-lg object-cover ring-2 ring-slate-700/50 hover:ring-blue-500/50 transition-all duration-300"
                            />
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                          </button>
                          <div>
                            <button
                              onClick={() => handleProfileClick(post.authorId, post.author)}
                              className="font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left block text-sm"
                            >
                              {post.author}
                            </button>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                              <Clock className="w-3 h-3" />
                              <span>{post.timeAgo}</span>
                            </div>
                          </div>
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
                          {user?.fullName === post.author && (
                            <button
                              onClick={() => {
                                setPostToDelete(post.id);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-200"
                              title="Delete post"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="mb-3">
                        <p className="text-gray-700 dark:text-slate-300 leading-relaxed text-sm">
                          {post.content}
                        </p>

                        {/* Post Images - Instagram Style */}
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
                                      onError={(e) => {
                                        const img = e.target as HTMLImageElement;
                                        const originalSrc = img.src;
                                        console.error('Image failed to load:', originalSrc);
                                        console.error('Image error event:', e);

                                        // Log additional debugging info
                                        console.log('Image details:', {
                                          originalSrc,
                                          naturalWidth: img.naturalWidth,
                                          naturalHeight: img.naturalHeight,
                                          complete: img.complete,
                                          currentSrc: img.currentSrc
                                        });

                                        // Try to show a fallback or placeholder
                                        img.style.display = 'none';

                                        // Check if placeholder already exists
                                        if (!img.parentNode?.querySelector('.image-error-placeholder')) {
                                          // Create a text placeholder
                                          const placeholder = document.createElement('div');
                                          placeholder.className = 'image-error-placeholder w-full h-full flex flex-col items-center justify-center bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400 rounded-2xl cursor-pointer hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors';
                                          placeholder.innerHTML = `
                                            <div class="text-center p-4">
                                              <div class="text-3xl mb-2">🖼️</div>
                                              <div class="text-sm font-medium mb-1">Image failed to load</div>
                                              <div class="text-xs opacity-75 mb-2">Click to open in new tab</div>
                                              <div class="text-xs opacity-50 font-mono bg-black/10 dark:bg-white/10 px-2 py-1 rounded max-w-48 truncate">
                                                ${originalSrc}
                                              </div>
                                            </div>
                                          `;
                                          placeholder.onclick = () => window.open(originalSrc, '_blank');
                                          img.parentNode?.appendChild(placeholder);
                                        }
                                      }}
                                      onLoad={(e) => {
                                        const img = e.target as HTMLImageElement;
                                        console.log('Image loaded successfully:', img.src, {
                                          naturalWidth: img.naturalWidth,
                                          naturalHeight: img.naturalHeight
                                        });
                                      }}
                                      style={{
                                        objectFit: 'cover',
                                        objectPosition: 'center'
                                      }}
                                    />
                                  </div>

                                  {/* Instagram-style gradient overlay */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-black/0 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl"></div>

                                  {/* Corner enhancement indicator */}
                                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : post.images.length === 2 ? (
                              <div className="grid grid-cols-2 gap-2 max-w-lg mx-auto aspect-[2/1]">
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
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                                      <div className="text-white/90 text-xs font-medium bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                                        Expand
                                      </div>
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
                                      src={post.images![0]}
                                      alt="Post image 1"
                                      className="w-full h-full object-cover transition-all duration-500 cursor-pointer group-hover:scale-105 group-hover:brightness-110"
                                      onClick={() => window.open(post.images![0], '_blank')}
                                      onLoad={(e) => {
                                        const img = e.target as HTMLImageElement;
                                        const aspectRatio = img.naturalWidth / img.naturalHeight;

                                        if (aspectRatio > 1.2) {
                                          img.style.objectPosition = 'center';
                                        } else if (aspectRatio < 0.8) {
                                          img.style.objectPosition = 'center 30%';
                                        } else {
                                          img.style.objectPosition = 'center';
                                        }
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                                      <div className="text-white/90 text-xs font-medium bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                                        Main
                                      </div>
                                    </div>
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
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                                          <div className="text-white/90 text-xs font-medium bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
                                            {index + 2}
                                          </div>
                                        </div>
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

                                    {/* Instagram-style hover overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                                      <div className="text-white/90 text-xs font-medium bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                                        View
                                      </div>
                                    </div>

                                    {/* More photos indicator */}
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
                                const optionVotes = (votes[index] as number) || 0;

                                // Calculate total votes by only counting numeric option votes (0, 1, 2, etc.)
                                const totalVotes = post.pollOptions!.reduce((sum, _, optionIndex) => {
                                  return sum + ((votes[optionIndex] as number) || 0);
                                }, 0);

                                const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;

                                // Check if current user has voted for this option
                                const userVotedForThis = votes.userVote === index;
                                const userHasVoted = votes.userVote !== undefined;

                                return (
                                  <div key={index} className="relative">
                                    <button
                                      onClick={() => !userHasVoted && handleVotePoll(post.id, index)}
                                      disabled={userHasVoted}
                                      className={`w-full p-3 rounded-xl border text-left transition-all duration-300 ${userVotedForThis
                                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                                        : userHasVoted
                                          ? 'bg-gray-200/50 dark:bg-slate-800/50 border-gray-300/30 dark:border-slate-600/30 text-gray-500 dark:text-slate-400 cursor-not-allowed'
                                          : 'bg-gray-100/50 dark:bg-slate-800/50 border-gray-300/30 dark:border-slate-600/30 hover:border-purple-500/50 hover:bg-purple-500/10 text-gray-800 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${userVotedForThis
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-gray-300 dark:bg-slate-700/50 text-gray-600 dark:text-slate-400'
                                            }`}>
                                            {String.fromCharCode(65 + index)}
                                          </div>
                                          <span className="font-medium">{option}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium">
                                            {percentage}%
                                          </span>
                                          <span className="text-xs text-slate-500">
                                            ({optionVotes} {optionVotes === 1 ? 'vote' : 'votes'})
                                          </span>
                                        </div>
                                      </div>

                                      {/* Progress bar */}
                                      {totalVotes > 0 && (
                                        <div className="mt-2 w-full bg-gray-300/30 dark:bg-slate-700/30 rounded-full h-1.5">
                                          <div
                                            className={`h-1.5 rounded-full transition-all duration-500 ${userVotedForThis ? 'bg-purple-500' : 'bg-gray-500 dark:bg-slate-600'
                                              }`}
                                            style={{ width: `${percentage}%` }}
                                          />
                                        </div>
                                      )}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Poll Stats */}
                            <div className="mt-4 pt-3 border-t border-gray-200/30 dark:border-slate-700/30 flex items-center justify-between text-sm text-gray-600 dark:text-slate-500 mb-4 pb-4 border-b border-gray-200/30 dark:border-slate-700/30">
                              <span>
                                {post.pollOptions.reduce((sum, _, optionIndex) => {
                                  return sum + (((post.pollVotes || {})[optionIndex] as number) || 0);
                                }, 0)} total votes
                              </span>
                              <div className="flex items-center gap-1">
                                <BarChart3 className="w-4 h-4" />
                                <span>Poll results</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Engagement Stats */}
                      {(post.stars > 0 || post.comments > 0) && (
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-slate-500 mb-4 pb-4 border-b border-gray-200/30 dark:border-slate-700/30">
                          <div className="flex items-center gap-4">
                            {post.stars > 0 && (
                              <span className="flex items-center gap-1">
                                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                                <span className="text-red-400 font-medium">{post.stars}</span>
                              </span>
                            )}
                          </div>
                          {post.comments > 0 && (
                            <button
                              onClick={() => toggleComments(post.id)}
                              className="hover:text-blue-400 transition-colors font-medium"
                            >
                              {post.comments} {post.comments === 1 ? 'comment' : 'comments'}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                        <button
                          onClick={() => handleStarPost(post.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${post.userStarred
                            ? "bg-red-500/20 text-red-400"
                            : "text-gray-600 dark:text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                            }`}
                        >
                          <Heart className={`w-4 h-4 ${post.userStarred ? "fill-current" : ""}`} />
                          <span>Love</span>
                        </button>

                        <button
                          onClick={() => toggleComments(post.id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-blue-500/10 hover:text-blue-400 transition-all duration-300"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Comment</span>
                        </button>

                        <div className="relative">
                          <button
                            onClick={() => setShareDropdownOpen(shareDropdownOpen === post.id ? null : post.id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all duration-300 whitespace-nowrap"
                          >
                            <Share className="w-4 h-4" />
                            <span>Share</span>
                            <ChevronDown className="w-3 h-3" />
                          </button>

                          {/* Share Dropdown */}
                          {shareDropdownOpen === post.id && (
                            <div className="absolute bottom-full left-0 mb-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-20">
                              <div className="p-2">
                                <button
                                  onClick={() => handleShareToTimeline(post.id)}
                                  className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-left whitespace-nowrap"
                                >
                                  <UserPlus className="w-4 h-4 flex-shrink-0" />
                                  <span>Share to Timeline</span>
                                </button>
                                <button
                                  onClick={() => handleCopyLink(post.id)}
                                  className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-left whitespace-nowrap"
                                >
                                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                                  <span>Copy Link</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleSavePost(post.id)}
                          className={`p-2 rounded-lg transition-all duration-300 ${savedPostIds.has(post.id)
                            ? 'text-amber-500 bg-amber-500/10 hover:text-amber-400'
                            : 'text-gray-600 dark:text-slate-400 hover:bg-amber-500/10 hover:text-amber-400'
                            }`}
                          title={savedPostIds.has(post.id) ? 'Remove from saved' : 'Save post'}
                        >
                          <Bookmark className={`w-4 h-4 ${savedPostIds.has(post.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Comments Section */}
                      {expandedComments.has(post.id) && (
                        <div className="pt-4 border-t border-gray-200/30 dark:border-slate-700/30">
                          {/* Add Comment Form */}
                          <div className="mb-6">
                            <AddCommentForm postId={post.id} onAddComment={handleAddComment} />
                          </div>

                          {/* Comments List */}
                          {post.commentsList.length > 0 && (
                            <div className="space-y-4">
                              {post.commentsList.map((comment) => (
                                <div key={comment.id} className="flex items-start gap-3">
                                  <button
                                    onClick={() => handleProfileClick(comment.authorId, comment.author)}
                                    className="relative hover:scale-110 transition-transform duration-300"
                                  >
                                    <img
                                      src={comment.authorImage}
                                      alt={comment.author}
                                      className="w-10 h-10 rounded-lg object-cover ring-2 ring-slate-700/50 hover:ring-blue-500/50 transition-all duration-300"
                                    />
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <div className="bg-gray-100/60 dark:bg-slate-800/40 rounded-xl px-4 py-3">
                                      <button
                                        onClick={() => handleProfileClick(comment.authorId, comment.author)}
                                        className="font-medium text-white text-sm mb-1 hover:text-blue-400 transition-colors text-left block"
                                      >
                                        {comment.author}
                                      </button>
                                      <p className="text-slate-300 text-sm leading-relaxed">
                                        {comment.content}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 ml-4">
                                      <span className="text-xs text-slate-500">
                                        {comment.timeAgo}
                                      </span>
                                      <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors">
                                        <Heart className="w-3 h-3" />
                                        {comment.likes > 0 && <span>{comment.likes}</span>}
                                      </button>
                                      <button className="text-xs text-slate-500 hover:text-blue-400 transition-colors">
                                        Reply
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <div className="text-center py-20">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      No posts yet
                    </h3>
                    <p className="text-gray-600 dark:text-slate-400 mb-6">
                      Be the first to start a conversation in our community!
                    </p>
                    <button
                      onClick={() => setShowCreatePostModal(true)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
                    >
                      Create First Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Chat Only */}
          <div className="hidden lg:block w-80 space-y-6 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin">
            {/* Chat Members */}
            <div className="bg-gradient-to-br from-white/60 to-gray-100/60 dark:from-slate-900/60 dark:to-slate-800/60 backdrop-blur rounded-2xl overflow-hidden border border-gray-200/30 dark:border-slate-700/30 shadow-xl">
              <div className="p-4 bg-gradient-to-r from-blue-500/20 to-purple-600/20">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-3 text-lg">
                  <MessageCircle className="w-5 h-5" />
                  Chat
                </h3>
              </div>
              <div className="p-4">
                <ChatSidebar />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePostModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreatePostModal(false);
              resetModalState();
            }
          }}
        >
          <div className="bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-enhanced border border-gray-300 dark:border-slate-700/50">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Post</h2>
              </div>
              <button
                onClick={() => {
                  setShowCreatePostModal(false);
                  resetModalState();
                }}
                className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* User Info */}
              <div className="flex items-center gap-3 mb-6">
                <img
                  src={user?.imageUrl || "https://i.pravatar.cc/150?img=12"}
                  alt="Your avatar"
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-gray-300 dark:ring-slate-700/50"
                />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {user?.fullName || user?.firstName || 'Anonymous'}
                  </h3>
                </div>
              </div>

              {/* Error Display */}
              {(error || uploadError) && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-xl">
                  <p className="text-red-400 text-sm">
                    {error || uploadError}
                  </p>
                </div>
              )}

              {/* Post Type Switcher */}
              <div className="flex items-center gap-2 mb-6 p-1 bg-gray-200/40 dark:bg-slate-800/40 rounded-xl">
                <button
                  onClick={() => setPostType('text')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${postType === 'text'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-300 dark:hover:bg-slate-700/50'
                    }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Text Post</span>
                </button>
                <button
                  onClick={() => setPostType('poll')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${postType === 'poll'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Poll</span>
                </button>
              </div>

              {/* Content Input */}
              {postType === 'text' ? (
                <div className="relative">
                  <textarea
                    placeholder="What's on your mind? Share your thoughts, ask a question, or start a discussion..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white dark:bg-slate-800/60 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 resize-none border border-gray-300 dark:border-slate-700/30"
                  />

                  {/* Image Previews - Instagram-like layout */}
                  {imagePreviewUrls.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-100/30 dark:bg-slate-800/30 rounded-xl border border-gray-200/30 dark:border-slate-700/30">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          {imagePreviewUrls.length} photo{imagePreviewUrls.length > 1 ? 's' : ''}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-slate-400">
                          {imagePreviewUrls.length}/4 max
                        </span>
                      </div>

                      {/* Instagram-like preview layout */}
                      <div className="space-y-4">
                        {/* Help text for positioning */}
                        {imagePreviewUrls.length > 0 && (
                          <div className="text-center">
                            <p className="text-xs text-gray-500 dark:text-slate-400">
                              💡 Click the <Move className="inline w-3 h-3 mx-1" /> button on any image to adjust how it appears when cropped
                            </p>
                          </div>
                        )}

                        {imagePreviewUrls.length === 1 ? (
                          // Single image preview with positioning controls
                          <div className="max-w-sm mx-auto">
                            <div className="relative group aspect-[4/3] overflow-hidden">
                              <img
                                src={imagePreviewUrls[0]}
                                alt="Preview 1"
                                className="w-full h-full object-cover rounded-xl border border-slate-600/30"
                                style={getImageStyle(0)}
                              />
                              <button
                                onClick={() => removeImage(0)}
                                className="absolute top-3 right-3 p-2.5 bg-red-500/90 hover:bg-red-500 text-white rounded-full opacity-80 hover:opacity-100 transition-all duration-200 shadow-lg"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingImageIndex(editingImageIndex === 0 ? null : 0)}
                                className="absolute top-3 left-3 p-2.5 bg-blue-500/90 hover:bg-blue-500 text-white rounded-full opacity-80 hover:opacity-100 transition-all duration-200 shadow-lg"
                              >
                                <Move className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Position controls for single image */}
                            {editingImageIndex === 0 && (
                              <div className="mt-3 p-3 bg-slate-700/50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm text-slate-300">Adjust Position</span>
                                  <button
                                    onClick={() => updateImagePosition(0, 50, 50)}
                                    className="text-xs text-blue-400 hover:text-blue-300"
                                  >
                                    Reset to Center
                                  </button>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <button onClick={() => updateImagePosition(0, 25, 25)} className="p-2 bg-slate-600/50 hover:bg-slate-600 rounded text-xs">Top Left</button>
                                  <button onClick={() => updateImagePosition(0, 50, 25)} className="p-2 bg-slate-600/50 hover:bg-slate-600 rounded text-xs">Top Center</button>
                                  <button onClick={() => updateImagePosition(0, 75, 25)} className="p-2 bg-slate-600/50 hover:bg-slate-600 rounded text-xs">Top Right</button>
                                  <button onClick={() => updateImagePosition(0, 25, 50)} className="p-2 bg-slate-600/50 hover:bg-slate-600 rounded text-xs">Left</button>
                                  <button onClick={() => updateImagePosition(0, 50, 50)} className="p-2 bg-slate-600/50 hover:bg-slate-600 rounded text-xs">Center</button>
                                  <button onClick={() => updateImagePosition(0, 75, 50)} className="p-2 bg-slate-600/50 hover:bg-slate-600 rounded text-xs">Right</button>
                                  <button onClick={() => updateImagePosition(0, 25, 75)} className="p-2 bg-slate-600/50 hover:bg-slate-600 rounded text-xs">Bottom Left</button>
                                  <button onClick={() => updateImagePosition(0, 50, 75)} className="p-2 bg-slate-600/50 hover:bg-slate-600 rounded text-xs">Bottom</button>
                                  <button onClick={() => updateImagePosition(0, 75, 75)} className="p-2 bg-slate-600/50 hover:bg-slate-600 rounded text-xs">Bottom Right</button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : imagePreviewUrls.length === 2 ? (
                          // Two images: shorter side by side
                          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto aspect-[2/1]">
                            {imagePreviewUrls.map((url, index) => (
                              <div key={index} className="relative group overflow-hidden">
                                <img
                                  src={url}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover rounded-xl border border-slate-600/30"
                                  style={getImageStyle(index)}
                                />
                                <button
                                  onClick={() => removeImage(index)}
                                  className="absolute top-2 right-2 p-2 bg-red-500/90 hover:bg-red-500 text-white rounded-full opacity-80 hover:opacity-100 transition-all duration-200 shadow-lg"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => setEditingImageIndex(editingImageIndex === index ? null : index)}
                                  className="absolute top-2 left-2 p-2 bg-blue-500/90 hover:bg-blue-500 text-white rounded-full opacity-80 hover:opacity-100 transition-all duration-200 shadow-lg"
                                >
                                  <Move className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : imagePreviewUrls.length === 3 ? (
                          // Three images: shorter 1 large + 2 small
                          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto aspect-[2/1]">
                            <div className="relative group row-span-2 overflow-hidden">
                              <img
                                src={imagePreviewUrls[0]}
                                alt="Preview 1"
                                className="w-full h-full object-cover rounded-xl border border-slate-600/30"
                                style={getImageStyle(0)}
                              />
                              <button
                                onClick={() => removeImage(0)}
                                className="absolute top-2 right-2 p-2 bg-red-500/90 hover:bg-red-500 text-white rounded-full opacity-80 hover:opacity-100 transition-all duration-200 shadow-lg"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setEditingImageIndex(editingImageIndex === 0 ? null : 0)}
                                className="absolute top-2 left-2 p-2 bg-blue-500/90 hover:bg-blue-500 text-white rounded-full opacity-80 hover:opacity-100 transition-all duration-200 shadow-lg"
                              >
                                <Move className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="space-y-3 h-full flex flex-col">
                              {imagePreviewUrls.slice(1).map((url, index) => (
                                <div key={index + 1} className="relative group flex-1 overflow-hidden">
                                  <img
                                    src={url}
                                    alt={`Preview ${index + 2}`}
                                    className="w-full h-full object-cover rounded-xl border border-slate-600/30"
                                    style={getImageStyle(index + 1)}
                                  />
                                  <button
                                    onClick={() => removeImage(index + 1)}
                                    className="absolute top-2 right-2 p-2 bg-red-500/90 hover:bg-red-500 text-white rounded-full opacity-80 hover:opacity-100 transition-all duration-200 shadow-lg"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => setEditingImageIndex(editingImageIndex === (index + 1) ? null : (index + 1))}
                                    className="absolute top-2 left-2 p-2 bg-blue-500/90 hover:bg-blue-500 text-white rounded-full opacity-80 hover:opacity-100 transition-all duration-200 shadow-lg"
                                  >
                                    <Move className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          // Four images: shorter 2x2 grid
                          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto aspect-[2/1]">
                            {imagePreviewUrls.map((url, index) => (
                              <div key={index} className="relative group overflow-hidden">
                                <img
                                  src={url}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover rounded-xl border border-slate-600/30"
                                  style={getImageStyle(index)}
                                />
                                <button
                                  onClick={() => removeImage(index)}
                                  className="absolute top-2 right-2 p-2 bg-red-500/90 hover:bg-red-500 text-white rounded-full opacity-80 hover:opacity-100 transition-all duration-200 shadow-lg"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => setEditingImageIndex(editingImageIndex === index ? null : index)}
                                  className="absolute top-2 left-2 p-2 bg-blue-500/90 hover:bg-blue-500 text-white rounded-full opacity-80 hover:opacity-100 transition-all duration-200 shadow-lg"
                                >
                                  <Move className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Position controls for multiple images */}
                        {editingImageIndex !== null && imagePreviewUrls.length > 1 && (
                          <div className="mt-3 p-3 bg-slate-700/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-slate-300">Adjust Position - Image {editingImageIndex + 1}</span>
                              <button
                                onClick={() => updateImagePosition(editingImageIndex, 50, 50)}
                                className="text-xs text-blue-400 hover:text-blue-300"
                              >
                                Reset to Center
                              </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <button onClick={() => updateImagePosition(editingImageIndex, 25, 25)} className="p-2 bg-slate-600/50 hover:bg-slate-600 rounded text-xs">Top Left</button>
                              <button onClick={() => updateImagePosition(editingImageIndex, 50, 25)} className="p-2 bg-slate-600/50 hover:bg-slate-600 rounded text-xs">Top Center</button>
                              <button onClick={() => updateImagePosition(editingImageIndex, 75, 25)} className="p-2 bg-slate-600/50 hover:bg-slate-600 rounded text-xs">Top Right</button>
                              <button onClick={() => updateImagePosition(editingImageIndex, 25, 50)} className="p-2 bg-slate-600/50 hover:bg-slate-600 rounded text-xs">Left</button>
                              <button onClick={() => updateImagePosition(editingImageIndex, 50, 50)} className="p-2 bg-slate-600/50 hover:bg-slate-600 rounded text-xs">Center</button>
                              <button onClick={() => updateImagePosition(editingImageIndex, 75, 50)} className="p-2 bg-slate-600/50 hover:bg-slate-600 rounded text-xs">Right</button>
                              <button onClick={() => updateImagePosition(editingImageIndex, 25, 75)} className="p-2 bg-slate-600/50 hover:bg-slate-600 rounded text-xs">Bottom Left</button>
                              <button onClick={() => updateImagePosition(editingImageIndex, 50, 75)} className="p-2 bg-slate-600/50 hover:bg-slate-600 rounded text-xs">Bottom</button>
                              <button onClick={() => updateImagePosition(editingImageIndex, 75, 75)} className="p-2 bg-slate-600/50 hover:bg-slate-600 rounded text-xs">Bottom Right</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Poll Question */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Poll Question
                    </label>
                    <textarea
                      placeholder="Ask a question for your community to vote on..."
                      value={pollQuestion}
                      onChange={(e) => setPollQuestion(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-white dark:bg-slate-800/60 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 resize-none border border-gray-300 dark:border-slate-700/30"
                    />
                  </div>

                  {/* Poll Options */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                        Poll Options
                      </label>
                      <span className="text-xs text-gray-500 dark:text-slate-400">
                        {pollOptions.length}/6 options
                      </span>
                    </div>
                    <div className="space-y-3">
                      {pollOptions.map((option, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-300 dark:bg-slate-700/50 flex items-center justify-center text-xs text-gray-600 dark:text-slate-400 font-medium">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <input
                            type="text"
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) => updatePollOption(index, e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-white dark:bg-slate-800/60 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 text-sm border border-gray-300 dark:border-slate-700/30"
                          />
                          {pollOptions.length > 2 && (
                            <button
                              onClick={() => removePollOption(index)}
                              className="p-2 text-gray-500 dark:text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-200"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {pollOptions.length < 6 && (
                      <button
                        onClick={addPollOption}
                        className="mt-3 flex items-center gap-2 px-3 py-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-all duration-200 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Option</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-slate-700/30">
              <div className="flex items-center justify-between">
                {/* Left: Upload Options - Only for text posts */}
                <div className="flex items-center gap-2">
                  {postType === 'text' && (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="p-2 text-gray-500 dark:text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all duration-200 cursor-pointer"
                      >
                        <ImageIcon className="w-5 h-5" />
                      </label>
                      {imagePreviewUrls.length > 0 && (
                        <span className="text-xs text-gray-500 dark:text-slate-500 ml-2">
                          {imagePreviewUrls.length}/4
                        </span>
                      )}
                    </>
                  )}
                  {postType === 'poll' && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-500">
                      <BarChart3 className="w-4 h-4" />
                      <span>Poll • {pollOptions.filter(opt => opt.trim()).length} options</span>
                    </div>
                  )}
                </div>

                {/* Right: Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowCreatePostModal(false);
                      resetModalState();
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-700/50 rounded-xl font-medium transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPost}
                    disabled={
                      (postType === 'text' && !newPostContent.trim()) ||
                      (postType === 'poll' && (!pollQuestion.trim() || pollOptions.filter(opt => opt.trim()).length < 2)) ||
                      isCreatingPost ||
                      uploading
                    }
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
                  >
                    {isCreatingPost || uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>
                          {uploading && selectedImages.length > 0
                            ? `Uploading image ${uploadingFileIndex}/${selectedImages.length}...`
                            : uploading
                              ? 'Uploading...'
                              : 'Publishing...'
                          }
                        </span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Publish {postType === 'poll' ? 'Poll' : 'Post'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Friends Modal */}
      {false && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              // Modal functionality removed
            }
          }}
        >
          <div className="bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur shadow-2xl w-full max-w-md rounded-2xl border border-gray-300 dark:border-slate-700/50">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invite Friends</h2>
              </div>
              <button
                onClick={() => {
                  // Modal functionality removed
                }}
                className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Share Manetho with Friends
                </h3>
                <p className="text-gray-600 dark:text-slate-400 text-sm">
                  Invite your study partners to join our learning community!
                </p>
              </div>

              {false && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Share this link:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value=""
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-100 dark:bg-slate-800/60 border border-gray-300 dark:border-slate-700/30 rounded-lg text-sm text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => { }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                    Link expires in 7 days
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-100/50 dark:bg-slate-800/30 rounded-xl">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Study Together</p>
                    <p className="text-xs text-gray-600 dark:text-slate-400">Join discussion groups and ask questions</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-100/50 dark:bg-slate-800/30 rounded-xl">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">AI-Powered Learning</p>
                    <p className="text-xs text-gray-600 dark:text-slate-400">Get instant help with doubt solving</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-100/50 dark:bg-slate-800/30 rounded-xl">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Study Groups</p>
                    <p className="text-xs text-gray-600 dark:text-slate-400">Create and join subject-specific groups</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 pb-6">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // Modal functionality removed
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-700/50 rounded-lg font-medium transition-all duration-200"
                >
                  Close
                </button>
                {false && (
                  <button
                    onClick={() => { }}
                    disabled={false}
                    className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {false ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Generate Link</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
                      {selectedPost.timeAgo}
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
                  <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {/* Post Title and Content */}
                  <div>
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
                          const optionVotes = (votes[index] as number) || 0;
                          const totalVotes = selectedPost.pollOptions!.reduce((sum, _, optionIndex) => {
                            return sum + ((votes[optionIndex] as number) || 0);
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
                    {selectedPost.stars > 0 && (
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                        <span className="text-red-400 font-medium">{selectedPost.stars}</span>
                      </span>
                    )}
                    {selectedPost.comments > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{selectedPost.comments} comments</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleStarPost(selectedPost.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${selectedPost.userStarred
                      ? "bg-red-500/20 text-red-400"
                      : "text-gray-600 dark:text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                      }`}
                  >
                    <Heart className={`w-4 h-4 ${selectedPost.userStarred ? "fill-current" : ""}`} />
                    <span>{selectedPost.userStarred ? 'Loved' : 'Love'}</span>
                  </button>

                  <button
                    onClick={() => handleSavePost(selectedPost.id)}
                    className={`p-2 rounded-lg transition-all duration-300 ${savedPostIds.has(selectedPost.id)
                      ? 'text-amber-500 bg-amber-500/10 hover:text-amber-400'
                      : 'text-gray-600 dark:text-slate-400 hover:bg-amber-500/10 hover:text-amber-400'
                      }`}
                    title={savedPostIds.has(selectedPost.id) ? 'Remove from saved' : 'Save post'}
                  >
                    <Bookmark className={`w-4 h-4 ${savedPostIds.has(selectedPost.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && postToDelete && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteModal(false);
              setPostToDelete(null);
            }
          }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-slate-700">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Delete Post?
              </h3>
              <p className="text-gray-600 dark:text-slate-400">
                Are you sure you want to delete this post? This action cannot be undone and the post will be permanently removed.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPostToDelete(null);
                }}
                className="flex-1 px-4 py-3 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePost(postToDelete)}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Comment form component
interface AddCommentFormProps {
  postId: string;
  onAddComment: (postId: string, comment: string) => void;
}

function AddCommentForm({ postId, onAddComment }: AddCommentFormProps) {
  const { user } = useUser();
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
      <div className="flex items-center gap-3">
        <img
          src={user?.imageUrl || "https://i.pravatar.cc/150?img=12"}
          alt="You"
          className="w-10 h-10 rounded-lg object-cover ring-2 ring-slate-700/50"
        />
        <div className="flex-1 relative">
          <input
            type="text"
            className="w-full px-4 py-3 bg-white dark:bg-slate-800/40 border border-gray-300 dark:border-slate-700/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 resize-none"
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
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-blue-400 hover:text-blue-300 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  );
} 
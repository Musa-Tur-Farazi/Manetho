"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  User, MessageCircle, BookOpen, BarChart,
  UserPlus, UserMinus, ChevronLeft, GraduationCap, Users,
  Heart, Share, Bookmark, MoreHorizontal, Clock, BarChart3
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "@/components/theme/ThemeProvider";

interface UserProfile {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  bio?: string;
  grade?: string;
  school?: string;
  country?: string;
  joinedAt: string;
  lastActiveAt?: string;
}

interface UserStats {
  totalStudyHours: number;
  groupsJoined: number;
  flashcardDecks: number;
  mindMapsSaved: number;
  problemsSolved: number;
  followersCount: number;
  followingCount: number;
}

interface UserPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  authorImage: string;
  date: string;
  timeAgo: string;
  stars: number;
  comments: number;
  userStarred: boolean;
  isPinned?: boolean;
  isShared?: boolean;
  originalAuthor?: string;
  originalPostId?: string;
  images?: string[];
  postType?: string;
  pollOptions?: string[];
  pollVotes?: Record<string, number>;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const currentUser = useUser().user;
  const { theme, setTheme } = useTheme();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'shared'>('posts');
  const [currentUserInternalId, setCurrentUserInternalId] = useState<string | null>(null);

  const userId = params.userId as string;

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserPosts();
      fetchUserStats();
    }
    if (currentUser) {
      fetchCurrentUserInternalId();
    }
  }, [userId, currentUser]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/community/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        const profile = data.profile;

        setUserProfile({
          userId: profile.userId,
          fullName: profile.fullName,
          email: profile.email,
          avatarUrl: profile.avatarUrl,
          bio: profile.bio,
          grade: profile.grade,
          school: profile.school,
          country: profile.country,
          joinedAt: profile.joinedAt,
          lastActiveAt: profile.lastActiveAt,
        });

        setUserStats({
          totalStudyHours: profile.totalStudyHours,
          groupsJoined: profile.groupsJoined,
          flashcardDecks: profile.flashcardDecks,
          mindMapsSaved: profile.mindMapsSaved,
          problemsSolved: profile.problemsSolved,
          followersCount: profile.followersCount,
          followingCount: profile.followingCount,
        });

        setIsFollowing(profile.isFollowing);
      } else if (response.status === 404) {
        setUserProfile(null);
      } else {
        throw new Error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const res = await fetch(`/api/profile/summary?userId=${userId}`);
      if (res.ok) {
        const stats = await res.json();
        setUserStats(stats);
      }
    } catch (e) { console.error(e); }
  };

  const fetchUserPosts = async () => {
    try {
      setPostsLoading(true);
      // Fetch user's original posts and shared posts
      const [postsResponse, sharedResponse] = await Promise.all([
        fetch(`/api/community/users/${userId}/posts`),
        fetch(`/api/community/users/${userId}/shared-posts`)
      ]);

      let allPosts: UserPost[] = [];

      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        allPosts = [...allPosts, ...postsData.posts];
      }

      if (sharedResponse.ok) {
        const sharedData = await sharedResponse.json();
        const sharedPosts = sharedData.posts.map((post: UserPost) => ({
          ...post,
          isShared: true
        }));
        allPosts = [...allPosts, ...sharedPosts];
      }

      // Sort by date
      allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setUserPosts(allPosts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchCurrentUserInternalId = async () => {
    if (!currentUser) return;

    try {
      // Fetch current user's profile to get internal ID
      const response = await fetch(`/api/community/users/${currentUser.id}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentUserInternalId(data.profile.userId);
      }
    } catch (error) {
      console.error('Error fetching current user internal ID:', error);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return;

    setFollowLoading(true);
    try {
      const response = await fetch('/api/community/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: userId,
          action: isFollowing ? 'unfollow' : 'follow',
        }),
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        // Update stats
        if (userStats) {
          setUserStats({
            ...userStats,
            followersCount: isFollowing
              ? userStats.followersCount - 1
              : userStats.followersCount + 1
          });
        }
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = () => {
    // Navigate to dedicated chat page with this user
    router.push(`/chat?with=${userId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getLastActiveText = (lastActiveAt?: string) => {
    if (!lastActiveAt) return 'Last seen unknown';

    const now = new Date();
    const lastActive = new Date(lastActiveAt);
    const diffInMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60));

    if (diffInMinutes < 5) return 'Active now';
    if (diffInMinutes < 60) return `Active ${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `Active ${Math.floor(diffInMinutes / 60)}h ago`;
    return `Active ${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 w-full">
        {/* Single Unified Compact Navbar */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200/30 dark:border-slate-700/30 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                title="Back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/home')}
                className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-purple-300 transition-all"
              >
                Manetho
              </button>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-lg font-bold text-gray-900 dark:text-slate-100">Learning Partner Profile</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200"
              >
                {theme === "dark" ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-16 pb-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="animate-pulse">
              <div className="bg-gradient-to-br from-white/60 to-gray-100/60 dark:from-slate-900/40 dark:to-slate-800/40 backdrop-blur rounded-2xl p-6 border border-gray-200/30 dark:border-slate-700/30 shadow-lg">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-gray-300 dark:bg-slate-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-8 w-48 bg-gray-300 dark:bg-slate-700 rounded mb-2"></div>
                    <div className="h-4 w-32 bg-gray-300 dark:bg-slate-700 rounded mb-4"></div>
                    <div className="h-10 w-24 bg-gray-300 dark:bg-slate-700 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 w-full">
        {/* Single Unified Compact Navbar */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200/30 dark:border-slate-700/30 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                title="Back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/home')}
                className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-purple-300 transition-all"
              >
                Manetho
              </button>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-lg font-bold text-gray-900 dark:text-slate-100">Learning Partner Profile</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200"
              >
                {theme === "dark" ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-16 pb-20">
          <div className="max-w-4xl mx-auto px-6 text-center py-12">
            <div className="bg-gradient-to-br from-white/60 to-gray-100/60 dark:from-slate-900/40 dark:to-slate-800/40 backdrop-blur rounded-2xl border border-gray-200/30 dark:border-slate-700/30 shadow-lg p-8">
              <User className="w-16 h-16 text-gray-400 dark:text-slate-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">User not found</h2>
              <p className="text-gray-600 dark:text-slate-400 mb-6">The profile you&apos;re looking for doesn&apos;t exist.</p>
              <Button onClick={() => router.back()} variant="outline">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 w-full">
      {/* Single Unified Compact Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200/30 dark:border-slate-700/30 shadow-lg">
        {/* Main Navigation Row - More Compact */}
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          {/* Left: Back Arrow + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200"
              title="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push('/home')}
              className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-purple-300 transition-all"
            >
              Manetho
            </button>
          </div>

          {/* Center: Profile Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-lg font-bold text-gray-900 dark:text-slate-100">Learning Partner Profile</h1>
          </div>

          {/* Right: Theme Toggle + User Menu */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* User Avatar Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800/50 transition-colors">
                <img
                  src={currentUser?.imageUrl || "https://i.pravatar.cc/150?img=12"}
                  alt="Profile"
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-gray-300 dark:ring-slate-700/50 group-hover:ring-blue-500/50 transition-all"
                />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-2">
                  <button
                    onClick={() => router.push(currentUser?.id ? `/profile/${currentUser.id}` : '/profile')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => router.push('/community')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    Community
                  </button>
                  <button
                    onClick={() => router.push('/home')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    Dashboard
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
        <div className="max-w-4xl mx-auto px-6">
          {/* Profile Card */}
          <div className="bg-gradient-to-br from-white/60 to-gray-100/60 dark:from-slate-900/40 dark:to-slate-800/40 backdrop-blur-sm rounded-2xl border border-gray-200/30 dark:border-slate-700/30 overflow-hidden mb-6 shadow-xl">
            <div className="p-6">
              <div className="flex flex-col md:flex-row items-start gap-6">
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.fullName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-slate-800"></div>
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{userProfile.fullName}</h2>
                      <p className="text-gray-600 dark:text-slate-400 text-sm mb-2">{getLastActiveText(userProfile.lastActiveAt)}</p>

                      {userProfile.grade && userProfile.school && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300 text-sm mb-2">
                          <GraduationCap className="w-4 h-4" />
                          <span>{userProfile.grade} • {userProfile.school}</span>
                        </div>
                      )}

                      {userProfile.country && (
                        <p className="text-gray-600 dark:text-slate-400 text-sm">📍 {userProfile.country}</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {currentUser && currentUserInternalId && userProfile.userId !== currentUserInternalId && (
                      <div className="flex gap-3">
                        <Button
                          onClick={handleFollow}
                          disabled={followLoading}
                          className={`${isFollowing
                            ? 'bg-gray-600 hover:bg-gray-700 text-gray-200 dark:bg-slate-600 dark:hover:bg-slate-700 dark:text-slate-200'
                            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                            } text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-200`}
                        >
                          {followLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          ) : isFollowing ? (
                            <UserMinus className="w-4 h-4 mr-2" />
                          ) : (
                            <UserPlus className="w-4 h-4 mr-2" />
                          )}
                          {isFollowing ? 'Unfollow' : 'Add Learning Partner'}
                        </Button>

                        <Button
                          onClick={handleMessage}
                          variant="outline"
                          className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {userProfile.bio && (
                    <div className="mt-4">
                      <p className="text-gray-700 dark:text-slate-300 leading-relaxed">{userProfile.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          {userStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 mb-8">
              <div className="bg-gradient-to-br from-white/60 to-gray-100/60 dark:from-slate-900/40 dark:to-slate-800/40 backdrop-blur rounded-xl p-6 text-center border border-gray-200/30 dark:border-slate-700/30 shadow-lg">
                <Users className="w-6 h-6 text-blue-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{userStats.followersCount}</p>
                <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">Learning Partners</p>
              </div>
              <div className="bg-gradient-to-br from-white/60 to-gray-100/60 dark:from-slate-900/40 dark:to-slate-800/40 backdrop-blur rounded-xl p-6 text-center border border-gray-200/30 dark:border-slate-700/30 shadow-lg">
                <User className="w-6 h-6 text-green-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{userStats.followingCount}</p>
                <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">Following</p>
              </div>
              <div className="bg-gradient-to-br from-white/60 to-gray-100/60 dark:from-slate-900/40 dark:to-slate-800/40 backdrop-blur rounded-xl p-6 text-center border border-gray-200/30 dark:border-slate-700/30 shadow-lg">
                <Users className="w-6 h-6 text-orange-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{userStats.groupsJoined}</p>
                <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">Groups Joined</p>
              </div>
              <div className="bg-gradient-to-br from-white/60 to-gray-100/60 dark:from-slate-900/40 dark:to-slate-800/40 backdrop-blur rounded-xl p-6 text-center border border-gray-200/30 dark:border-slate-700/30 shadow-lg">
                <BookOpen className="w-6 h-6 text-cyan-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{userStats.flashcardDecks}</p>
                <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">Flashcard Decks</p>
              </div>
              <div className="bg-gradient-to-br from-white/60 to-gray-100/60 dark:from-slate-900/40 dark:to-slate-800/40 backdrop-blur rounded-xl p-6 text-center border border-gray-200/30 dark:border-slate-700/30 shadow-lg">
                <BarChart className="w-6 h-6 text-pink-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{userStats.mindMapsSaved}</p>
                <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">Mind Maps</p>
              </div>
            </div>
          )}







          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="bg-gradient-to-br from-white/60 to-gray-100/60 dark:from-slate-900/40 dark:to-slate-800/40 backdrop-blur rounded-2xl border border-gray-200/30 dark:border-slate-700/30 shadow-lg overflow-hidden">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`flex-1 px-6 py-4 font-medium transition-all duration-300 ${activeTab === 'posts'
                    ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-gray-100/50 dark:hover:bg-slate-800/30'
                    }`}
                >
                  Posts ({userPosts.filter(p => !p.isShared).length})
                </button>
                <button
                  onClick={() => setActiveTab('shared')}
                  className={`flex-1 px-6 py-4 font-medium transition-all duration-300 ${activeTab === 'shared'
                    ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-gray-100/50 dark:hover:bg-slate-800/30'
                    }`}
                >
                  Shared ({userPosts.filter(p => p.isShared).length})
                </button>
              </div>
            </div>
          </div>

          {/* Posts Section */}
          <div className="space-y-4 mb-6">
            {postsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gradient-to-br from-white/60 to-gray-100/60 dark:from-slate-900/40 dark:to-slate-800/40 backdrop-blur rounded-xl p-6 border border-gray-200/30 dark:border-slate-700/30 animate-pulse shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gray-300 dark:bg-slate-700 rounded-full"></div>
                      <div>
                        <div className="h-4 w-32 bg-gray-300 dark:bg-slate-700 rounded mb-1"></div>
                        <div className="h-3 w-20 bg-gray-300 dark:bg-slate-700 rounded"></div>
                      </div>
                    </div>
                    <div className="h-6 w-3/4 bg-gray-300 dark:bg-slate-700 rounded mb-2"></div>
                    <div className="h-4 w-full bg-gray-300 dark:bg-slate-700 rounded mb-1"></div>
                    <div className="h-4 w-2/3 bg-gray-300 dark:bg-slate-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {userPosts
                  .filter(post => activeTab === 'posts' ? !post.isShared : post.isShared)
                  .map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}

                {userPosts.filter(post => activeTab === 'posts' ? !post.isShared : post.isShared).length === 0 && (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-br from-white/60 to-gray-100/60 dark:from-slate-900/40 dark:to-slate-800/40 backdrop-blur rounded-2xl border border-gray-200/30 dark:border-slate-700/30 shadow-lg p-8">
                      <BookOpen className="w-16 h-16 text-gray-400 dark:text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
                        No {activeTab} yet
                      </h3>
                      <p className="text-gray-600 dark:text-slate-400">
                        {activeTab === 'posts'
                          ? "This user hasn't created any posts yet."
                          : "This user hasn't shared any posts yet."
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="bg-gradient-to-br from-white/60 to-gray-100/60 dark:from-slate-900/40 dark:to-slate-800/40 backdrop-blur rounded-2xl p-6 border border-gray-200/30 dark:border-slate-700/30 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">About</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">Joined Manetho</p>
                <p className="text-gray-900 dark:text-slate-200">{formatDate(userProfile.joinedAt)}</p>
              </div>
              {userProfile.lastActiveAt && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">Last Active</p>
                  <p className="text-gray-900 dark:text-slate-200">{getLastActiveText(userProfile.lastActiveAt)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Post Card Component
const PostCard = ({ post }: { post: UserPost }) => {
  const [isLiked, setIsLiked] = useState(post.userStarred);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.stars);

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/community/threads/${post.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.content,
          url: window.location.href,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${post.title}\n\n${post.content}\n\n${window.location.href}`);
        // You could add a toast notification here
        alert('Post link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handleBookmark = async () => {
    try {
      const response = await fetch('/api/community/saved-posts', {
        method: isBookmarked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId: post.id }),
      });

      if (response.ok) {
        setIsBookmarked(!isBookmarked);
      }
    } catch (error) {
      console.error('Error bookmarking post:', error);
    }
  };

  const handleComment = () => {
    // Navigate to post detail page
    window.location.href = `/community/thread/${post.id}`;
  };

  return (
    <div className="bg-gradient-to-br from-white/60 to-gray-100/60 dark:from-slate-900/40 dark:to-slate-800/40 backdrop-blur rounded-xl border border-gray-200/30 dark:border-slate-700/30 overflow-hidden hover:shadow-xl hover:border-gray-300/50 dark:hover:border-slate-600/50 transition-all duration-300 shadow-lg">
      <div className="p-6">
        {/* Post Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={post.authorImage}
              alt={post.author}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-slate-700 hover:ring-blue-500/50 transition-all duration-300"
            />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">{post.author}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                <Clock className="w-3 h-3" />
                <span>{post.timeAgo}</span>
                {post.isShared && (
                  <>
                    <span>•</span>
                    <Share className="w-3 h-3" />
                    <span className="text-emerald-500">Shared</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="relative group">
            <MoreHorizontal className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 cursor-pointer transition-colors" />
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 leading-tight">
            {post.title}
          </h3>
          <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
            {post.content}
          </p>
        </div>

        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <div className="mb-4">
            {post.images.length === 1 ? (
              // Single image: Shorter aspect ratio
              <div className="relative w-full aspect-[4/3] overflow-hidden">
                <img
                  src={post.images[0]}
                  alt="Post image"
                  className="w-full h-full object-cover rounded-xl border border-gray-300 dark:border-slate-700/30 hover:border-gray-400 dark:hover:border-slate-600/50 transition-all duration-300 cursor-pointer"
                  onClick={() => window.open(post.images![0], '_blank')}
                  onError={() => {
                    console.error('Failed to load image');
                  }}
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/5 rounded-xl transition-all duration-300 pointer-events-none"></div>
                {/* Click hint overlay */}
                <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="bg-black/60 text-white text-xs px-2 py-1 rounded-lg backdrop-blur">
                    Click for full size
                  </div>
                </div>
              </div>
            ) : post.images.length === 2 ? (
              // Two images: Shorter side by side grid
              <div className="grid grid-cols-2 gap-2 w-full aspect-[2/1]">
                {post.images.map((image, index) => (
                  <div key={index} className="relative group overflow-hidden">
                    <img
                      src={image}
                      alt={`Post image ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-gray-300 dark:border-slate-700/30 hover:border-gray-400 dark:hover:border-slate-600/50 transition-all duration-300 cursor-pointer"
                      onClick={() => window.open(image, '_blank')}
                      onError={() => {
                        console.error('Failed to load image');
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-all duration-300"></div>
                    {/* Click hint overlay */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-black/60 text-white text-xs px-2 py-1 rounded-lg backdrop-blur">
                        Click for full size
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : post.images.length === 3 ? (
              // Three images: Shorter Instagram-style layout
              <div className="grid grid-cols-2 gap-2 w-full aspect-[2/1]">
                <div className="relative group row-span-2 overflow-hidden">
                  <img
                    src={post.images[0]}
                    alt="Post image 1"
                    className="w-full h-full object-cover rounded-lg border border-gray-300 dark:border-slate-700/30 hover:border-gray-400 dark:hover:border-slate-600/50 transition-all duration-300 cursor-pointer"
                    onClick={() => window.open(post.images![0], '_blank')}
                    onError={() => {
                      console.error('Failed to load image');
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-all duration-300"></div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-black/60 text-white text-xs px-2 py-1 rounded-lg backdrop-blur">
                      Click for full size
                    </div>
                  </div>
                </div>
                <div className="space-y-2 h-full flex flex-col">
                  {post.images.slice(1).map((image, index) => (
                    <div key={index + 1} className="relative group flex-1 overflow-hidden">
                      <img
                        src={image}
                        alt={`Post image ${index + 2}`}
                        className="w-full h-full object-cover rounded-lg border border-gray-300 dark:border-slate-700/30 hover:border-gray-400 dark:hover:border-slate-600/50 transition-all duration-300 cursor-pointer"
                        onClick={() => window.open(image, '_blank')}
                        onError={() => {
                          console.error('Failed to load image');
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-all duration-300"></div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-black/60 text-white text-xs px-2 py-1 rounded-lg backdrop-blur">
                          Click for full size
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Four or more images: Shorter 2x2 grid
              <div className="grid grid-cols-2 gap-2 w-full aspect-[2/1]">
                {post.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="relative group overflow-hidden">
                    <img
                      src={image}
                      alt={`Post image ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-gray-300 dark:border-slate-700/30 hover:border-gray-400 dark:hover:border-slate-600/50 transition-all duration-300 cursor-pointer"
                      onClick={() => window.open(image, '_blank')}
                      onError={() => {
                        console.error('Failed to load image');
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-all duration-300"></div>
                    {/* Show "+X more" overlay on last image if there are more than 4 */}
                    {index === 3 && post.images!.length > 4 && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <div className="text-white text-lg font-bold">
                          +{post.images!.length - 4} more
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-black/60 text-white text-xs px-2 py-1 rounded-lg backdrop-blur">
                        Click for full size
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Poll */}
        {post.postType === 'poll' && post.pollOptions && (
          <div className="mb-4 p-4 bg-gray-100/50 dark:bg-slate-800/30 rounded-2xl border border-gray-200/30 dark:border-slate-700/30">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">Poll</span>
            </div>

            <div className="space-y-3">
              {post.pollOptions.map((option, index) => {
                const votes = post.pollVotes || {};
                const optionVotes = votes[index] || 0;

                // Calculate total votes by only counting numeric option votes (0, 1, 2, etc.)
                const totalVotes = post.pollOptions!.reduce((sum, _, optionIndex) => {
                  return sum + (votes[optionIndex] || 0);
                }, 0);

                const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;

                // Check if current user has voted for this option
                const userVotedForThis = votes.userVote === index;
                const userHasVoted = votes.userVote !== undefined;

                return (
                  <div key={index} className="relative">
                    <div
                      className={`w-full p-3 rounded-xl border text-left transition-all duration-300 ${userVotedForThis
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-600 dark:text-purple-300'
                        : userHasVoted
                          ? 'bg-gray-200/50 dark:bg-slate-800/50 border-gray-300/30 dark:border-slate-600/30 text-gray-500 dark:text-slate-400 cursor-not-allowed'
                          : 'bg-gray-100/50 dark:bg-slate-800/50 border-gray-300/30 dark:border-slate-600/30 text-gray-800 dark:text-slate-300'
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
                          <span className="text-xs text-gray-500 dark:text-slate-500">
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
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Poll Stats */}
            <div className="mt-4 pt-3 border-t border-gray-200/30 dark:border-slate-700/30 flex items-center justify-between text-sm text-gray-600 dark:text-slate-500">
              <span>
                {post.pollOptions.reduce((sum, _, optionIndex) => {
                  return sum + ((post.pollVotes || {})[optionIndex] || 0);
                }, 0)} total votes
              </span>
              <div className="flex items-center gap-1">
                <BarChart3 className="w-4 h-4" />
                <span>Poll results</span>
              </div>
            </div>
          </div>
        )}

        {/* Post Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isLiked
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                : "text-gray-600 dark:text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              <span>{likeCount}</span>
            </button>
            <button 
              onClick={handleComment}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-blue-500/10 hover:text-blue-500 transition-all duration-300"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments}</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all duration-300"
              title="Share post"
            >
              <Share className="w-4 h-4" />
            </button>
            <button 
              onClick={handleBookmark}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isBookmarked
                ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                : "text-gray-600 dark:text-slate-400 hover:bg-yellow-500/10 hover:text-yellow-400"
                }`}
              title={isBookmarked ? "Remove bookmark" : "Bookmark post"}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 
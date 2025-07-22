"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import {
  User, Edit, BookOpen, Calendar, Award, BarChart, Clock,
<<<<<<< HEAD
  Save, X, ChevronRight, Book, Pencil, MailOpen, Link as LinkIcon,
  Star, GraduationCap, Trophy, Target, Zap, TrendingUp,
  Crown, Medal, CheckCircle, Flame, BarChart3, Share2,
  MessageSquare, Heart, Eye, Users, BrainCircuit, FileText,
  BookMarked, TestTube, Bookmark, MessageCircle, ThumbsUp
=======
  Save, X, ChevronRight, Pencil, MailOpen, Link as LinkIcon,
  GraduationCap
>>>>>>> 708c8c56af1dbeacd172d286642eb215ed7e8059
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import AchievementBadge, { Achievement } from "@/components/AchievementBadge";

// Interface for study activity
interface StudyActivity {
  id: string;
  type: string;
  title: string;
  date: Date;
  duration?: number;
  subject?: string;
  topic?: string;
}

interface CommunityPost {
  threadId: string;
  title: string;
  body: string;
  likeCount: number;
  commentCount: number;
  postType: string;
  createdAt: string;
  subjectName?: string;
  topicName?: string;
  creatorName?: string;
  savedAt?: string;
}

interface UserActivityData {
  stats: {
    totalStudyHours: number;
    totalSessions: number;
    totalQueries: number;
    flashcardDecks: number;
    mindMapsSaved: number;
    problemsSolved: number;
    groupsCreated: number;
    groupsJoined: number;
    postsCreated: number;
    postsSaved: number;
    activityCounts: Record<string, number>;
    averageQuizScore: number;
    totalQuizPoints: number;
  };
  recentActivities: StudyActivity[];
  createdPosts: CommunityPost[];
  savedPosts: Array<{
    savedAt: string;
    thread: CommunityPost;
  }>;
  studyStreak: {
    currentStreak: number;
    longestStreak: number;
    lastStudyDate: string;
  } | null;
  userProfile: {
    bio: string;
    grade: string;
    school: string;
    studyGoals: string;
  } | null;
}

interface QuizStats {
  totalQuizzesCompleted: number;
  totalPoints: number;
  averageScore: number;
  bestScore: number;
  maxLevel: number;
  totalXp: number;
  overallAccuracy: number;
  totalSubjects: number;
  achievementsCount: number;
}

interface StudyStreak {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
}

interface UserRanking {
  rank: number;
  totalPoints: number;
  currentLevel: number;
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser();

  // Profile information states
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [educationLevel, setEducationLevel] = useState("University");
  const [fieldOfStudy, setFieldOfStudy] = useState("Computer Science");
  const [profileLinks, setProfileLinks] = useState<{ type: string, url: string }[]>([
    { type: "email", url: "" },
    { type: "website", url: "" },
    { type: "github", url: "" }
  ]);
  const [studyPreferences, setStudyPreferences] = useState<string[]>([
    "Group study", "Visual learning", "Problem-based"
  ]);

  // Activity states
  const [activeTab, setActiveTab] = useState<"overview" | "groups" | "flashcards" | "mind-maps" | "solved" | "quiz" | "posts">("overview");
  const [activityData, setActivityData] = useState<UserActivityData | null>(null);
  const [activityLoading, setActivityLoading] = useState(true);

  // Quiz states
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null);
  const [studyStreak, setStudyStreak] = useState<StudyStreak | null>(null);
  const [userRanking, setUserRanking] = useState<UserRanking | null>(null);
  const [quizLoading, setQuizLoading] = useState(true);

  // Sample achievements data
  const sampleAchievements: Achievement[] = [
    {
      id: 'first-quiz',
      name: 'First Steps',
      description: 'Complete your first quiz',
      iconType: 'trophy',
      badgeColor: '#FFD700',
      rarity: 'common',
      category: 'completion',
      xpReward: 10,
      pointsReward: 5,
      earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    },
    {
      id: 'perfect-score',
      name: 'Perfectionist',
      description: 'Score 100% on any quiz',
      iconType: 'star',
      badgeColor: '#FF6B6B',
      rarity: 'rare',
      category: 'score',
      xpReward: 25,
      pointsReward: 15,
      earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    },
    {
      id: 'speed-demon',
      name: 'Speed Demon',
      description: 'Complete a quiz in under 2 minutes',
      iconType: 'zap',
      badgeColor: '#4ECDC4',
      rarity: 'epic',
      category: 'speed',
      xpReward: 50,
      pointsReward: 30,
      progress: 75,
    },
    {
      id: 'streak-master',
      name: 'Streak Master',
      description: 'Maintain a 30-day study streak',
      iconType: 'flame',
      badgeColor: '#FF9500',
      rarity: 'legendary',
      category: 'streak',
      xpReward: 100,
      pointsReward: 75,
      isLocked: true,
    },
    {
      id: 'quiz-champion',
      name: 'Quiz Champion',
      description: 'Complete 100 quizzes',
      iconType: 'crown',
      badgeColor: '#FFD700',
      rarity: 'legendary',
      category: 'completion',
      xpReward: 200,
      pointsReward: 150,
      progress: 45,
    },
    {
      id: 'math-wizard',
      name: 'Math Wizard',
      description: 'Achieve 90%+ accuracy in Mathematics',
      iconType: 'target',
      badgeColor: '#9B59B6',
      rarity: 'epic',
      category: 'subject',
      xpReward: 75,
      pointsReward: 50,
      earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: 'comeback-kid',
      name: 'Comeback Kid',
      description: 'Improve your score by 50 points in one day',
      iconType: 'trendingUp',
      badgeColor: '#2ECC71',
      rarity: 'rare',
      category: 'improvement',
      xpReward: 40,
      pointsReward: 25,
      progress: 20,
    },
    {
      id: 'early-bird',
      name: 'Early Bird',
      description: 'Complete 10 quizzes before 8 AM',
      iconType: 'calendar',
      badgeColor: '#F39C12',
      rarity: 'rare',
      category: 'time',
      xpReward: 30,
      pointsReward: 20,
      progress: 60,
    },
  ];

  // Initialize user data when loaded
  useEffect(() => {
    if (isLoaded && user) {
      setDisplayName(user.fullName || "");
      setProfileLinks([
        { type: "email", url: user.primaryEmailAddress?.emailAddress || "" },
        { type: "website", url: "" },
        { type: "github", url: "" }
      ]);

      // Load real activity data
      loadActivityData();
      // Load quiz data
      loadQuizData();
    }
  }, [isLoaded, user]);

  const loadActivityData = async () => {
    try {
      const response = await fetch('/api/profile/activity');
      const data = await response.json();

      if (response.ok) {
        setActivityData(data.data);

        // Update profile information if available
        if (data.data.userProfile) {
          const profile = data.data.userProfile;
          setBio(profile.bio || "");
          setEducationLevel(profile.grade || "University");
          setFieldOfStudy(profile.school || "Computer Science");
        }
      }
    } catch (error) {
      console.error('Error loading activity data:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  const loadQuizData = async () => {
    try {
      const response = await fetch('/api/quiz/stats');
      const data = await response.json();

      if (response.ok) {
        setQuizStats(data.overallStats);
        setStudyStreak(data.studyStreak);
        setUserRanking(data.ranking);
      }
    } catch (error) {
      console.error('Error loading quiz data:', error);
    } finally {
      setQuizLoading(false);
    }
  };

  // Handle save profile changes
  const handleSaveProfile = () => {
    // In a real app, this would save to a database
    setIsEditing(false);
    // Show success message
  };

  // Format date for display
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return dateObj.toLocaleDateString([], { weekday: 'long' });
    } else {
      return dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Get icon for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "group":
        return <Users className="w-4 h-4 text-blue-500" />;
      case "flashcard":
      case "flashcards":
        return <BookOpen className="w-4 h-4 text-green-500" />;
      case "mind-map":
      case "mindmap":
        return <BarChart className="w-4 h-4 text-purple-500" />;
      case "solved":
      case "quiz":
        return <TestTube className="w-4 h-4 text-orange-500" />;
      case "chat":
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case "test":
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case "doubt-solving":
        return <BrainCircuit className="w-4 h-4 text-indigo-500" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get post type icon
  const getPostTypeIcon = (postType: string) => {
    switch (postType) {
      case 'question':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'poll':
        return <BarChart3 className="w-4 h-4 text-purple-500" />;
      case 'resource':
        return <FileText className="w-4 h-4 text-green-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-20 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Your Profile"
        description="Manage your personal information and track your learning journey"
      />

      <div className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={user?.imageUrl || "https://i.pravatar.cc/150?img=1"}
                        alt={displayName}
                        className="w-16 h-16 rounded-full object-cover border-2 border-cyan-500"
                      />
                      {!isEditing && (
                        <button className="absolute bottom-0 right-0 bg-cyan-500 text-white p-1 rounded-full">
                          <Edit className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                        />
                      ) : (
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          {displayName}
                        </h2>
                      )}
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {educationLevel} • {fieldOfStudy}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          onClick={handleSaveProfile}
                          className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1 text-sm"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          onClick={() => setIsEditing(false)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 text-sm"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1 text-sm"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">About</h4>
                  {isEditing ? (
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm resize-none"
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {bio || "No bio added yet. Click Edit Profile to add one."}
                    </p>
                  )}
                </div>

                {/* Quiz Stats in Profile Card */}
                {!quizLoading && quizStats && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quiz Progress</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Level</span>
                        <div className="flex items-center space-x-1">
                          <GraduationCap className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {quizStats.maxLevel}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Global Rank</span>
                        <div className="flex items-center space-x-1">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            #{userRanking?.rank || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Current Streak</span>
                        <div className="flex items-center space-x-1">
                          <Flame className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {studyStreak?.currentStreak || 0} days
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Accuracy</span>
                        <div className="flex items-center space-x-1">
                          <Target className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {quizStats.overallAccuracy?.toFixed(1) || 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ... existing profile links and preferences sections ... */}
              </div>
            </div>
          </div>

          {/* Activity and Stats */}
          <div className="lg:col-span-2">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col items-center justify-center">
                <Clock className="w-6 h-6 text-cyan-600 dark:text-cyan-400 mb-2" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {activityData?.stats.totalStudyHours || 0}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Hours Studied</span>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col items-center justify-center">
                <Users className="w-6 h-6 text-blue-500 mb-2" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {activityData?.stats.groupsJoined || 0}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Groups Joined</span>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-500 mb-2" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {activityData?.stats.flashcardDecks || 0}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Flashcard Decks</span>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col items-center justify-center">
                <BarChart className="w-6 h-6 text-purple-500 mb-2" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {activityData?.stats.mindMapsSaved || 0}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Mind Maps</span>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col items-center justify-center">
                <TestTube className="w-6 h-6 text-orange-500 mb-2" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {activityData?.stats.problemsSolved || 0}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Problems Solved</span>
              </div>
              {/* Quiz Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-500 mb-2" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {quizStats?.totalQuizzesCompleted || 0}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Quizzes Completed</span>
              </div>
            </div>

            {/* Activity Tabs and List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex overflow-x-auto">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === "overview"
                      ? "border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("quiz")}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === "quiz"
                      ? "border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                  >
                    Quiz Progress
                  </button>
                  <button
                    onClick={() => setActiveTab("posts")}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === "posts"
                      ? "border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                  >
                    Community Posts
                  </button>
                  <button
                    onClick={() => setActiveTab("groups")}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === "groups"
                      ? "border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                  >
                    Study Groups
                  </button>
                  <button
                    onClick={() => setActiveTab("flashcards")}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === "flashcards"
                      ? "border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                  >
                    Flashcards
                  </button>
                  <button
                    onClick={() => setActiveTab("mind-maps")}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === "mind-maps"
                      ? "border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                  >
                    Mind Maps
                  </button>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {activeTab === "overview" ? "Recent Activity" :
                    activeTab === "quiz" ? "Quiz Statistics" :
                      activeTab === "posts" ? "Community Posts" :
                        activeTab === "groups" ? "Your Study Groups" :
                          activeTab === "flashcards" ? "Your Flashcard Decks" :
                            activeTab === "mind-maps" ? "Your Mind Maps" : "Solved Problems"}
                </h3>

                {/* Community Posts Tab */}
                {activeTab === "posts" && (
                  <div className="space-y-6">
                    {activityLoading ? (
                      <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Created Posts */}
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-blue-500" />
                            Created Posts ({activityData?.stats.postsCreated || 0})
                          </h4>
                          <div className="space-y-3">
                            {activityData?.createdPosts.slice(0, 5).map((post) => (
                              <div key={post.threadId} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0">
                                    {getPostTypeIcon(post.postType)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                      {post.title}
                                    </h5>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                      {post.body}
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                      <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center space-x-1">
                                          <ThumbsUp className="w-3 h-3" />
                                          <span>{post.likeCount}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <MessageCircle className="w-3 h-3" />
                                          <span>{post.commentCount}</span>
                                        </div>
                                      </div>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatDate(post.createdAt)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {(!activityData?.createdPosts || activityData.createdPosts.length === 0) && (
                              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No posts created yet</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Saved Posts */}
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                            <Bookmark className="w-5 h-5 mr-2 text-green-500" />
                            Saved Posts ({activityData?.stats.postsSaved || 0})
                          </h4>
                          <div className="space-y-3">
                            {activityData?.savedPosts.slice(0, 5).map((savedPost) => (
                              <div key={savedPost.thread.threadId} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0">
                                    {getPostTypeIcon(savedPost.thread.postType)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                      {savedPost.thread.title}
                                    </h5>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                      By {savedPost.thread.creatorName}
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                      <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center space-x-1">
                                          <ThumbsUp className="w-3 h-3" />
                                          <span>{savedPost.thread.likeCount}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <MessageCircle className="w-3 h-3" />
                                          <span>{savedPost.thread.commentCount}</span>
                                        </div>
                                      </div>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        Saved {formatDate(savedPost.savedAt)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {(!activityData?.savedPosts || activityData.savedPosts.length === 0) && (
                              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No saved posts yet</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Quiz Tab */}
                {activeTab === "quiz" && (
                  <div className="space-y-6">
                    {/* Quiz Progress Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">Total Points</h4>
                          <Trophy className="w-5 h-5 text-yellow-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {quizStats?.totalPoints || 0}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          From {quizStats?.totalQuizzesCompleted || 0} quizzes
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">Best Score</h4>
                          <Star className="w-5 h-5 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {quizStats?.bestScore || 0}%
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Personal best
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">Study Streak</h4>
                          <Flame className="w-5 h-5 text-orange-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {studyStreak?.currentStreak || 0}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Current streak (days)
                        </p>
                      </div>
                    </div>

                    {/* Achievements Section */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                          <Award className="w-5 h-5 mr-2 text-purple-500" />
                          Achievements
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {sampleAchievements.filter(a => a.earnedAt).length} / {sampleAchievements.length} earned
                        </div>
                      </div>

                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                        {sampleAchievements.map((achievement) => (
                          <div key={achievement.id} className="flex flex-col items-center">
                            <AchievementBadge
                              achievement={achievement}
                              size="md"
                              showProgress={!achievement.earnedAt}
                              showDetails={false}
                            />
                            <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                              {achievement.name}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Recent Achievements */}
                      <div className="mt-6">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-3">Recent Achievements</h5>
                        <div className="space-y-2">
                          {sampleAchievements
                            .filter(a => a.earnedAt)
                            .sort((a, b) => new Date(b.earnedAt!).getTime() - new Date(a.earnedAt!).getTime())
                            .slice(0, 3)
                            .map((achievement) => (
                              <div
                                key={achievement.id}
                                className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700/50 rounded-lg"
                              >
                                <AchievementBadge
                                  achievement={achievement}
                                  size="sm"
                                  showProgress={false}
                                  showDetails={false}
                                />
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                                    {achievement.name}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {achievement.description}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                    +{achievement.xpReward} XP
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(achievement.earnedAt!).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Progress Towards Next Achievement */}
                      <div className="mt-6">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-3">In Progress</h5>
                        <div className="space-y-3">
                          {sampleAchievements
                            .filter(a => !a.earnedAt && a.progress !== undefined)
                            .slice(0, 3)
                            .map((achievement) => (
                              <div
                                key={achievement.id}
                                className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700/50 rounded-lg"
                              >
                                <AchievementBadge
                                  achievement={achievement}
                                  size="sm"
                                  showProgress={true}
                                  showDetails={false}
                                />
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                                    {achievement.name}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                    {achievement.description}
                                  </p>
                                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                    <div
                                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${achievement.progress}%` }}
                                    />
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                    {achievement.progress}%
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    +{achievement.xpReward} XP
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Detailed Quiz Stats */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Performance</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Average Score</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {quizStats?.averageScore?.toFixed(1) || 0}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Overall Accuracy</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {quizStats?.overallAccuracy?.toFixed(1) || 0}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Subjects Attempted</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {quizStats?.totalSubjects || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Progress</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Current Level</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {quizStats?.maxLevel || 1}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Total XP</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {quizStats?.totalXp || 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Achievements</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {sampleAchievements.filter(a => a.earnedAt).length}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    {activityLoading ? (
                      <div className="animate-pulse space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        ))}
                      </div>
                    ) : activityData?.recentActivities.length ? (
                      activityData.recentActivities.map((activity) => (
                        <div key={activity.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-start">
                          <div className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm mr-4">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-gray-900 dark:text-white font-medium">
                                  {activity.title}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {formatDate(activity.date)}
                                  {activity.duration && ` • ${activity.duration} mins`}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No recent activity to display</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Other tabs (placeholder) */}
                {["groups", "flashcards", "mind-maps", "solved"].includes(activeTab) && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="w-12 h-12 mx-auto mb-4 opacity-50">
                      {activeTab === "groups" && <Users className="w-full h-full" />}
                      {activeTab === "flashcards" && <BookOpen className="w-full h-full" />}
                      {activeTab === "mind-maps" && <BarChart className="w-full h-full" />}
                      {activeTab === "solved" && <TestTube className="w-full h-full" />}
                    </div>
                    <p>Coming soon - detailed view for {activeTab}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 
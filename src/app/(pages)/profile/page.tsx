"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import {
  User, Edit, BookOpen, Calendar, Award, BarChart, Clock,
  Save, X, ChevronRight, Book, Pencil, MailOpen, Link as LinkIcon,
  Star, GraduationCap
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

// Interface for study activity
interface StudyActivity {
  id: string;
  type: "group" | "flashcard" | "mind-map" | "solved";
  title: string;
  date: Date;
  duration?: number; // in minutes
  progress?: number; // percentage
  score?: number;
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
  const [activeTab, setActiveTab] = useState<"overview" | "groups" | "flashcards" | "mind-maps" | "solved">("overview");
  const [recentActivities, setRecentActivities] = useState<StudyActivity[]>([]);
  const [stats, setStats] = useState({
    totalStudyHours: 0,
    groupsJoined: 0,
    flashcardDecks: 0,
    mindMapsSaved: 0,
    problemsSolved: 0
  });

  // Initialize user data when loaded
  useEffect(() => {
    if (isLoaded && user) {
      setDisplayName(user.fullName || "");
      setProfileLinks([
        { type: "email", url: user.primaryEmailAddress?.emailAddress || "" },
        { type: "website", url: "" },
        { type: "github", url: "" }
      ]);

      // Load fake activity data
      loadActivityData();
    }
  }, [isLoaded, user]);

  // Simulate loading activity data
  const loadActivityData = () => {
    // Generate mock data for recent activities
    const mockActivities: StudyActivity[] = [
      {
        id: "act-1",
        type: "group",
        title: "Organic Chemistry Study Group",
        date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        duration: 90 // 1.5 hours
      },
      {
        id: "act-2",
        type: "flashcard",
        title: "Anatomy Terms",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        score: 85
      },
      {
        id: "act-3",
        type: "mind-map",
        title: "Data Structures Overview",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        progress: 100
      },
      {
        id: "act-4",
        type: "solved",
        title: "Calculus Integration Problems",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        score: 92
      },
      {
        id: "act-5",
        type: "group",
        title: "Python Programming Workshop",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
        duration: 120 // 2 hours
      }
    ];

    setRecentActivities(mockActivities);

    // Set mock statistics
    setStats({
      totalStudyHours: 47,
      groupsJoined: 3,
      flashcardDecks: 8,
      mindMapsSaved: 5,
      problemsSolved: 63
    });
  };

  // Handle save profile changes
  const handleSaveProfile = () => {
    // In a real app, this would save to a database
    setIsEditing(false);
    // Show success message
  };

  // Format date for display
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Get icon for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "group":
        return <User className="w-4 h-4 text-blue-500" />;
      case "flashcard":
        return <BookOpen className="w-4 h-4 text-green-500" />;
      case "mind-map":
        return <BarChart className="w-4 h-4 text-purple-500" />;
      case "solved":
        return <Pencil className="w-4 h-4 text-orange-500" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-500" />;
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
                          className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-xl font-semibold text-gray-900 dark:text-white mb-1 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      ) : (
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {displayName}
                        </h3>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Member since {user?.createdAt ? new Date(user?.createdAt).toLocaleDateString() : "2023"}
                      </p>
                    </div>
                  </div>

                  {!isEditing ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveProfile}
                      >
                        <Save className="w-4 h-4 mr-1" /> Save
                      </Button>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">About</h4>
                  {isEditing ? (
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Write a short bio about yourself..."
                      className="w-full bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white min-h-[100px] focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  ) : (
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {bio || "No bio provided yet. Click 'Edit' to add information about yourself."}
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Education</h4>
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                          Level
                        </label>
                        <select
                          value={educationLevel}
                          onChange={(e) => setEducationLevel(e.target.value)}
                          className="w-full bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value="High School">High School</option>
                          <option value="University">University</option>
                          <option value="Graduate">Graduate</option>
                          <option value="Postgraduate">Postgraduate</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                          Field of Study
                        </label>
                        <input
                          type="text"
                          value={fieldOfStudy}
                          onChange={(e) => setFieldOfStudy(e.target.value)}
                          className="w-full bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span className="text-gray-900 dark:text-white text-sm">
                        {educationLevel} • {fieldOfStudy}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Links</h4>
                  {isEditing ? (
                    <div className="space-y-3">
                      {profileLinks.map((link, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-20 text-xs text-gray-500 dark:text-gray-400">
                            {link.type.charAt(0).toUpperCase() + link.type.slice(1)}
                          </div>
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => {
                              const newLinks = [...profileLinks];
                              newLinks[index].url = e.target.value;
                              setProfileLinks(newLinks);
                            }}
                            className="flex-1 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            placeholder={`Your ${link.type} address`}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {profileLinks.map((link, index) => (
                        link.url && (
                          <div key={index} className="flex items-center gap-2">
                            {link.type === "email" ? (
                              <MailOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                            ) : (
                              <LinkIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                            )}
                            <a
                              href={link.type === "email" ? `mailto:${link.url}` : link.url}
                              className="text-cyan-600 dark:text-cyan-400 text-sm hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {link.url}
                            </a>
                          </div>
                        )
                      ))}
                      {!profileLinks.some(link => link.url) && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm italic">No links added yet</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Study Preferences</h4>
                  {isEditing ? (
                    <div className="flex flex-wrap gap-2">
                      {["Group study", "Visual learning", "Problem-based", "Self-paced", "Audio learning", "Practical application"].map((pref) => (
                        <button
                          key={pref}
                          onClick={() => {
                            if (studyPreferences.includes(pref)) {
                              setStudyPreferences(studyPreferences.filter(p => p !== pref));
                            } else {
                              setStudyPreferences([...studyPreferences, pref]);
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-xs ${studyPreferences.includes(pref)
                            ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-200"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                        >
                          {pref}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {studyPreferences.map((pref) => (
                        <span
                          key={pref}
                          className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-200 px-3 py-1 rounded-full text-xs"
                        >
                          {pref}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Activity and Stats */}
          <div className="lg:col-span-2">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col items-center justify-center">
                <Clock className="w-6 h-6 text-cyan-600 dark:text-cyan-400 mb-2" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalStudyHours}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Hours Studied</span>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col items-center justify-center">
                <User className="w-6 h-6 text-blue-500 mb-2" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">{stats.groupsJoined}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Groups Joined</span>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-500 mb-2" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">{stats.flashcardDecks}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Flashcard Decks</span>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col items-center justify-center">
                <BarChart className="w-6 h-6 text-purple-500 mb-2" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">{stats.mindMapsSaved}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Mind Maps</span>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col items-center justify-center">
                <Award className="w-6 h-6 text-orange-500 mb-2" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">{stats.problemsSolved}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Problems Solved</span>
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
                  <button
                    onClick={() => setActiveTab("solved")}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === "solved"
                      ? "border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                  >
                    Solved Problems
                  </button>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {activeTab === "overview" ? "Recent Activity" :
                    activeTab === "groups" ? "Your Study Groups" :
                      activeTab === "flashcards" ? "Your Flashcard Decks" :
                        activeTab === "mind-maps" ? "Your Mind Maps" : "Solved Problems"}
                </h3>

                {activeTab === "overview" ? (
                  <div className="space-y-4">
                    {recentActivities.length > 0 ? (
                      recentActivities.map((activity) => (
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
                                  {activity.duration && ` • ${activity.duration} min`}
                                  {activity.score && ` • Score: ${activity.score}%`}
                                  {activity.progress && ` • ${activity.progress === 100 ? 'Completed' : `${activity.progress}% complete`}`}
                                </p>
                              </div>
                              <button className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300">
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            </div>

                            {activity.type === "group" && (
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex -space-x-2">
                                  {[1, 2, 3].map((i) => (
                                    <img
                                      key={i}
                                      src={`https://i.pravatar.cc/150?img=${i + 10}`}
                                      alt={`Participant ${i}`}
                                      className="w-6 h-6 rounded-full border border-white dark:border-gray-800"
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">+3 others</span>
                              </div>
                            )}

                            {activity.type === "flashcard" && activity.score && (
                              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                <div
                                  className="bg-green-500 h-1.5 rounded-full"
                                  style={{ width: `${activity.score}%` }}
                                ></div>
                              </div>
                            )}

                            {activity.type === "mind-map" && activity.progress && (
                              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                <div
                                  className="bg-purple-500 h-1.5 rounded-full"
                                  style={{ width: `${activity.progress}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Clock className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                          No activity yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          Start studying to see your recent activities here
                        </p>
                        <Button>Get Started</Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    {activeTab === "groups" ? (
                      <User className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                    ) : activeTab === "flashcards" ? (
                      <BookOpen className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                    ) : activeTab === "mind-maps" ? (
                      <BarChart className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                    ) : (
                      <Pencil className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                    )}
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      Coming Soon
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      This feature is still under development
                    </p>
                    <Button onClick={() => setActiveTab("overview")}>Back to Overview</Button>
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
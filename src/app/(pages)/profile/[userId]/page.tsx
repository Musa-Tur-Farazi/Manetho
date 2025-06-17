"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  User, MessageCircle, Calendar, Award, Edit2, Save, X,
  UserPlus, UserMinus, ChevronLeft, Users, MapPin, School,
  GraduationCap, Globe, Clock, BookOpen, Target, Trophy,
  Settings, Mail, Phone, Cake, Languages, Heart
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "@/components/theme/ThemeProvider";

interface UserProfile {
  id: number;
  clerkId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  imageUrl?: string;
  username?: string;
  role: string;
  age?: number;
  isActive: boolean;
  bio?: string;
  preferences?: string;
  createdAt: string;
  updatedAt: string;
  profileData?: {
    profileId: string;
    grade?: string;
    school?: string;
    dateOfBirth?: string;
    country?: string;
    timezone?: string;
    preferredLanguage?: string;
    studyGoals?: string;
    profileCreatedAt: string;
    profileUpdatedAt: string;
  };
  isFollowing: boolean;
  stats: {
    followersCount: number;
    followingCount: number;
    postsCount: number;
    commentsCount: number;
    totalStudyTime: number;
    studySessionsCount: number;
  };
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    iconUrl?: string;
    badgeColor?: string;
    points: number;
    earnedAt: string;
  }>;
  canEdit: boolean;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useUser();
  const { theme } = useTheme();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for editing
  const [editForm, setEditForm] = useState({
    name: '',
    firstName: '',
    lastName: '',
    username: '',
    age: '',
    bio: '',
    grade: '',
    school: '',
    dateOfBirth: '',
    country: '',
    timezone: '',
    preferredLanguage: '',
    studyGoals: ''
  });

  const userId = params.userId as string;

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching profile for user:', userId);
      
      const response = await fetch(`/api/community/users/${userId}`);
      console.log('API Response status:', response.status);
      
      const data = await response.json();
      console.log('API Response data:', data);

      if (!response.ok) {
        // Handle the case where user needs to be synced
        if (data.needsSync) {
          console.log('User needs sync, attempting to sync...');
          try {
            const syncResponse = await fetch('/api/auth/sync-user', {
              method: 'POST',
            });
            
            if (syncResponse.ok) {
              console.log('User synced successfully, retrying profile fetch...');
              // Retry fetching profile after sync
              const retryResponse = await fetch(`/api/community/users/${userId}`);
              const retryData = await retryResponse.json();
              
              if (retryResponse.ok && retryData.profile) {
                setUserProfile(retryData.profile);
                
                // Initialize edit form with current data
                setEditForm({
                  name: retryData.profile.name || '',
                  firstName: retryData.profile.firstName || '',
                  lastName: retryData.profile.lastName || '',
                  username: retryData.profile.username || '',
                  age: retryData.profile.age?.toString() || '',
                  bio: retryData.profile.bio || '',
                  grade: retryData.profile.profileData?.grade || '',
                  school: retryData.profile.profileData?.school || '',
                  dateOfBirth: retryData.profile.profileData?.dateOfBirth || '',
                  country: retryData.profile.profileData?.country || '',
                  timezone: retryData.profile.profileData?.timezone || '',
                  preferredLanguage: retryData.profile.profileData?.preferredLanguage || 'en',
                  studyGoals: retryData.profile.profileData?.studyGoals || ''
                });
                return; // Success, exit function
              }
            }
          } catch (syncError) {
            console.error('Failed to sync user:', syncError);
          }
        }
        
        const errorMessage = data.error || 'Failed to fetch profile';
        const errorDetails = data.details ? `: ${data.details}` : '';
        throw new Error(`${errorMessage}${errorDetails}`);
      }

      if (!data.profile) {
        throw new Error('Profile data is missing from response');
      }

      setUserProfile(data.profile);
      
      // Initialize edit form with current data
      setEditForm({
        name: data.profile.name || '',
        firstName: data.profile.firstName || '',
        lastName: data.profile.lastName || '',
        username: data.profile.username || '',
        age: data.profile.age?.toString() || '',
        bio: data.profile.bio || '',
        grade: data.profile.profileData?.grade || '',
        school: data.profile.profileData?.school || '',
        dateOfBirth: data.profile.profileData?.dateOfBirth || '',
        country: data.profile.profileData?.country || '',
        timezone: data.profile.profileData?.timezone || '',
        preferredLanguage: data.profile.profileData?.preferredLanguage || 'en',
        studyGoals: data.profile.profileData?.studyGoals || ''
      });

    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch profile');
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!userProfile) return;

    setSaveLoading(true);
    try {
      const updateData = {
        ...editForm,
        age: editForm.age ? parseInt(editForm.age) : null
      };

      const response = await fetch(`/api/community/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setEditMode(false);
        // Refresh profile data
        await fetchUserProfile();
      } else {
        throw new Error(data.details || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !userProfile) return;

    setFollowLoading(true);
    try {
      const response = await fetch('/api/community/users/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: userId,
          action: userProfile.isFollowing ? 'unfollow' : 'follow',
        }),
      });

      if (response.ok) {
        setUserProfile(prev => {
          if (!prev) return null;
          return {
            ...prev,
            isFollowing: !prev.isFollowing,
            stats: {
              ...prev.stats,
              followersCount: prev.isFollowing
                ? prev.stats.followersCount - 1
                : prev.stats.followersCount + 1
            }
          };
        });
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = () => {
    router.push(`/chat?with=${userId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-32 w-32 rounded-full bg-gray-200 dark:bg-gray-700 mb-4"></div>
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">{error}</p>
            <Button onClick={() => router.push('/home')}>Return Home</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">User Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">The user you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push('/home')}>Return Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={userProfile.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&background=6366f1&color=fff`}
                alt={userProfile.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-lg"
              />
              {userProfile.isActive && (
                <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-700"></div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  {editMode ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Display Name"
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        />
                        <input
                          type="text"
                          placeholder="Username"
                          value={editForm.username}
                          onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                          className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="First Name"
                          value={editForm.firstName}
                          onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                          className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        />
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={editForm.lastName}
                          onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                          className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <textarea
                        placeholder="Bio"
                        value={editForm.bio}
                        onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {userProfile.name}
                        {userProfile.username && (
                          <span className="text-lg font-normal text-gray-500 dark:text-gray-400 ml-2">
                            @{userProfile.username}
                          </span>
                        )}
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {userProfile.email}
                      </p>
                      {userProfile.bio && (
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                          {userProfile.bio}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {userProfile.canEdit && (
                    <>
                      {editMode ? (
                        <>
                          <Button
                            onClick={handleSaveProfile}
                            disabled={saveLoading}
                            className="flex items-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            {saveLoading ? 'Saving...' : 'Save'}
                          </Button>
                          <Button
                            onClick={() => setEditMode(false)}
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => setEditMode(true)}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Profile
                        </Button>
                      )}
                    </>
                  )}
                  {currentUser && currentUser.id !== userProfile.clerkId && (
                    <>
                      <Button
                        onClick={handleFollow}
                        disabled={followLoading}
                        variant={userProfile.isFollowing ? "outline" : "default"}
                        className="flex items-center gap-2"
                      >
                        {userProfile.isFollowing ? (
                          <>
                            <UserMinus className="w-4 h-4" />
                            Unfollow
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            Follow
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleMessage}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message
                      </Button>
                    </>
                  )}
                  {!currentUser && (
                    <Button
                      onClick={() => router.push('/sign-in')}
                      variant="default"
                      className="flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Sign In
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Personal Information</h2>
              
              {editMode ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
                      <input
                        type="number"
                        placeholder="Age"
                        value={editForm.age}
                        onChange={(e) => setEditForm({...editForm, age: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grade</label>
                      <input
                        type="text"
                        placeholder="Grade/Class"
                        value={editForm.grade}
                        onChange={(e) => setEditForm({...editForm, grade: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">School</label>
                      <input
                        type="text"
                        placeholder="School/Institution"
                        value={editForm.school}
                        onChange={(e) => setEditForm({...editForm, school: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                      <input
                        type="text"
                        placeholder="Country"
                        value={editForm.country}
                        onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={editForm.dateOfBirth}
                        onChange={(e) => setEditForm({...editForm, dateOfBirth: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred Language</label>
                      <select
                        value={editForm.preferredLanguage}
                        onChange={(e) => setEditForm({...editForm, preferredLanguage: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      >
                        <option value="en">English</option>
                        <option value="bn">Bengali</option>
                        <option value="hi">Hindi</option>
                        <option value="ar">Arabic</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Study Goals</label>
                    <textarea
                      placeholder="What are your study goals?"
                      value={editForm.studyGoals}
                      onChange={(e) => setEditForm({...editForm, studyGoals: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {userProfile.age && (
                    <div className="flex items-center gap-3">
                      <Cake className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Age</p>
                        <p className="font-medium text-gray-900 dark:text-white">{userProfile.age}</p>
                      </div>
                    </div>
                  )}
                  {userProfile.profileData?.grade && (
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Grade</p>
                        <p className="font-medium text-gray-900 dark:text-white">{userProfile.profileData.grade}</p>
                      </div>
                    </div>
                  )}
                  {userProfile.profileData?.school && (
                    <div className="flex items-center gap-3">
                      <School className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">School</p>
                        <p className="font-medium text-gray-900 dark:text-white">{userProfile.profileData.school}</p>
                      </div>
                    </div>
                  )}
                  {userProfile.profileData?.country && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Country</p>
                        <p className="font-medium text-gray-900 dark:text-white">{userProfile.profileData.country}</p>
                      </div>
                    </div>
                  )}
                  {userProfile.role && (
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-indigo-500" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">{userProfile.role}</p>
                      </div>
                    </div>
                  )}
                  {userProfile.profileData?.preferredLanguage && (
                    <div className="flex items-center gap-3">
                      <Languages className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Language</p>
                        <p className="font-medium text-gray-900 dark:text-white">{userProfile.profileData.preferredLanguage?.toUpperCase() || 'EN'}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {userProfile.profileData?.studyGoals && !editMode && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Study Goals</h3>
                  <p className="text-gray-700 dark:text-gray-300">{userProfile.profileData.studyGoals}</p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(userProfile.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Activity Stats */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Activity Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-600 dark:text-gray-400">Followers</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{userProfile.stats.followersCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Following</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{userProfile.stats.followingCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-600 dark:text-gray-400">Posts</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{userProfile.stats.postsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-600 dark:text-gray-400">Comments</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{userProfile.stats.commentsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-red-500" />
                    <span className="text-gray-600 dark:text-gray-400">Study Hours</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{userProfile.stats.totalStudyTime}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-500" />
                    <span className="text-gray-600 dark:text-gray-400">Sessions</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{userProfile.stats.studySessionsCount}</span>
                </div>
              </div>
            </div>

            {/* Achievements */}
            {userProfile.achievements.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Achievements</h3>
                <div className="space-y-3">
                  {userProfile.achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                      {achievement.iconUrl ? (
                        <img src={achievement.iconUrl} alt={achievement.name} className="w-8 h-8" />
                      ) : (
                        <Trophy className="w-8 h-8 text-yellow-500" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{achievement.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{achievement.points} points</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(achievement.earnedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
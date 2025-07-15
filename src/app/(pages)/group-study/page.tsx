"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import { Calendar, Users, Plus, Search, MessageSquare } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

// Types for real API data
interface StudyGroup {
  groupId: string;
  name: string;
  description: string;
  meetingType: string;
  nextMeeting: string | null;
  meetingTime: string | null;
  currentParticipants: number;
  maxParticipants: number;
  subjectName: string | null;
  subjectColor: string | null;
  creatorName: string | null;
  creatorAvatar: string | null;
  memberRole: string;
  joinedAt: string;
  tags?: string[] | null;
}

interface ActiveGroup {
  groupId: string;
  name: string;
  description: string;
  meetingType: string;
  currentParticipants: number;
  maxParticipants: number;
  subjectName: string | null;
  subjectColor: string | null;
  tags?: string[] | null;
}

export default function GroupStudyPage() {
  const { user } = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubject, setActiveSubject] = useState("All");
  const [meetingTypeFilter, setMeetingTypeFilter] = useState("All");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);
  const [activeGroups, setActiveGroups] = useState<ActiveGroup[]>([]);
  const [joinLoading, setJoinLoading] = useState<string | null>(null);

  // Form state for creating new groups
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupSubject, setGroupSubject] = useState("");
  const [groupMeetingType, setGroupMeetingType] = useState<"online" | "in-person" | "hybrid">("online");

  const subjects = [
    "All",
    "Mathematics",
    "Chemistry",
    "Physics",
    "Biology",
    "Computer Science",
    "Psychology",
    "Engineering",
    "Pre-Med",
    "Business",
    "Languages"
  ];

  // Fetch user's study groups
  useEffect(() => {
    fetchStudyGroups();
  }, []);

  const fetchStudyGroups = async () => {
    try {
      setLoading(true);

      // Fetch user's groups and active groups in parallel
      const [myGroupsRes, activeGroupsRes] = await Promise.all([
        fetch('/api/community/study-groups?type=my-groups'),
        fetch('/api/community/study-groups?type=active-groups')
      ]);

      if (myGroupsRes.ok) {
        const myGroupsData = await myGroupsRes.json();
        setMyGroups(myGroupsData.groups || []);
      }

      if (activeGroupsRes.ok) {
        const activeGroupsData = await activeGroupsRes.json();
        setActiveGroups(activeGroupsData.groups || []);
      }
    } catch (error) {
      console.error('Error fetching study groups:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle joining a group
  const handleJoinGroup = async (groupId: string) => {
    if (!user || joinLoading) return;

    try {
      setJoinLoading(groupId);
      const response = await fetch('/api/community/study-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId,
          action: 'join',
        }),
      });

      if (response.ok) {
        // Refresh the groups list
        await fetchStudyGroups();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to join group');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      alert('Failed to join group');
    } finally {
      setJoinLoading(null);
    }
  };

  // Handle leaving a group
  const handleLeaveGroup = async (groupId: string) => {
    if (!user || joinLoading) return;

    try {
      setJoinLoading(groupId);
      const response = await fetch('/api/community/study-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId,
          action: 'leave',
        }),
      });

      if (response.ok) {
        // Refresh the groups list
        await fetchStudyGroups();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to leave group');
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      alert('Failed to leave group');
    } finally {
      setJoinLoading(null);
    }
  };

  // Navigate to group chat
  const handleOpenChat = (groupId: string) => {
    router.push(`/group-study/chat/${groupId}`);
  };

  // Filter groups based on search and filters
  const getFilteredGroups = (groups: (StudyGroup | ActiveGroup)[]) => {
    return groups.filter((group) => {
      const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubject = activeSubject === "All" ||
        (group.subjectName && group.subjectName === activeSubject);

      const matchesMeetingType = meetingTypeFilter === "All" ||
        (meetingTypeFilter === "Online" && group.meetingType === "online") ||
        (meetingTypeFilter === "In-Person" && group.meetingType === "in-person") ||
        (meetingTypeFilter === "Hybrid" && group.meetingType === "hybrid");

      return matchesSearch && matchesSubject && matchesMeetingType;
    });
  };

  // Handle creating a new group
  const handleCreateGroup = async () => {
    if (!user || !groupName.trim() || !groupDescription.trim() || !groupSubject.trim()) return;

    try {
      const response = await fetch('/api/community/study-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          name: groupName.trim(),
          description: groupDescription.trim(),
          subjectName: groupSubject.trim(),
          meetingType: groupMeetingType,
          maxParticipants: 10, // Default max participants
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Group created successfully:', result);

        // Reset form and close modal
        resetForm();

        // Refresh the groups list to show the new group
        await fetchStudyGroups();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group');
    }
  };

  // Reset form fields
  const resetForm = () => {
    setGroupName("");
    setGroupDescription("");
    setGroupSubject("");
    setGroupMeetingType("online");
    setShowCreateForm(false);
  };

  // Function to get meeting type badge styling
  const getMeetingTypeBadge = (type: string) => {
    switch (type) {
      case "online":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "in-person":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "hybrid":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "TBD";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "TBD";
    }
  };

  const filteredMyGroups = getFilteredGroups(myGroups);
  const filteredActiveGroups = getFilteredGroups(activeGroups);

  if (loading) {
    return (
      <>
        <PageHeader
          title="Group Study"
          description="Connect with fellow students and study together"
        />
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Group Study"
        description="Connect with fellow students and study together"
      />

      {/* Hero banner */}
      <div className="relative mb-12 rounded-3xl overflow-hidden shadow-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 md:p-12 flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex-1 z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 drop-shadow-lg">
            Find or Create a Study Group
          </h2>
          <p className="text-white/90 max-w-xl leading-relaxed">
            Collaborate in real-time, share resources and ace your exams together. Choose a subject below or start your own group in seconds.
          </p>
        </div>
        <div className="hidden md:block absolute -right-12 -bottom-12 opacity-20 rotate-6 pointer-events-none">
          <Users className="w-[300px] h-[300px] text-white" />
        </div>
      </div>

      {/* My Study Groups Section */}
      {myGroups.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Study Groups</h2>
            <span className="px-3 py-1 text-sm bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full">
              {myGroups.length} group{myGroups.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMyGroups.map((group) => (
              <div
                key={group.groupId}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {group.subjectName && (
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300">
                        {group.subjectName}
                      </span>
                    )}
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${getMeetingTypeBadge(group.meetingType)}`}>
                      {group.meetingType === "online" ? "Online" :
                        group.meetingType === "in-person" ? "In-Person" : "Hybrid"}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{group.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{group.description}</p>

                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(group.nextMeeting)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{group.currentParticipants}/{group.maxParticipants}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleOpenChat(group.groupId)}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Open Chat
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleLeaveGroup(group.groupId)}
                    disabled={joinLoading === group.groupId}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Leave
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search study groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Group
          </Button>
        </div>

        {/* Subject Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => setActiveSubject(subject)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeSubject === subject
                ? "bg-emerald-500 text-white"
                : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
                }`}
            >
              {subject}
            </button>
          ))}
        </div>

        {/* Meeting Type Filter */}
        <div className="flex gap-2">
          {["All", "Online", "In-Person", "Hybrid"].map((type) => (
            <button
              key={type}
              onClick={() => setMeetingTypeFilter(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${meetingTypeFilter === type
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
                }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Available Groups Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Available Study Groups</h2>

        {filteredActiveGroups.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActiveGroups.map((group) => {
              const isAlreadyMember = myGroups.some(myGroup => myGroup.groupId === group.groupId);
              const isFull = group.currentParticipants >= group.maxParticipants;

              return (
                <div
                  key={group.groupId}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-2 mb-4">
                    {group.subjectName && (
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300">
                        {group.subjectName}
                      </span>
                    )}
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${getMeetingTypeBadge(group.meetingType)}`}>
                      {group.meetingType === "online" ? "Online" :
                        group.meetingType === "in-person" ? "In-Person" : "Hybrid"}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{group.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{group.description}</p>

                  <div className="flex items-center gap-1 mb-4 text-sm text-gray-600 dark:text-gray-300">
                    <Users className="w-4 h-4" />
                    <span>{group.currentParticipants}/{group.maxParticipants} members</span>
                  </div>

                  <Button
                    onClick={() => handleJoinGroup(group.groupId)}
                    disabled={isAlreadyMember || isFull || joinLoading === group.groupId}
                    className={`w-full ${isAlreadyMember
                      ? "bg-gray-400 cursor-not-allowed"
                      : isFull
                        ? "bg-red-400 cursor-not-allowed"
                        : "bg-emerald-500 hover:bg-emerald-600"
                      } text-white`}
                  >
                    {joinLoading === group.groupId ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Joining...
                      </div>
                    ) : isAlreadyMember ? "Already Joined"
                      : isFull ? "Group Full"
                        : "Join Group"}
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No study groups found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Try adjusting your filters or create a new study group to get started.
            </p>
          </div>
        )}
      </div>

      {/* Create Group Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Study Group</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Enter group name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 dark:text-white resize-none"
                  placeholder="Describe your study group..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject *
                  </label>
                  <select
                    value={groupSubject}
                    onChange={(e) => setGroupSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 dark:text-white"
                  >
                    <option value="">Select subject...</option>
                    {subjects.slice(1).map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meeting Type
                  </label>
                  <select
                    value={groupMeetingType}
                    onChange={(e) => setGroupMeetingType(e.target.value as "online" | "in-person" | "hybrid")}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 dark:text-white"
                  >
                    <option value="online">Online</option>
                    <option value="in-person">In-Person</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={resetForm}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || !groupDescription.trim() || !groupSubject.trim()}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  Create Group
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 
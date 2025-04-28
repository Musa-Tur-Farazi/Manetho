"use client";

import { useState } from "react";
import { Button } from "../../../../components/ui/Button";
import PageHeader from "../../../../components/ui/PageHeader";
import { User, Calendar, MapPin, Users, Clock, Filter, ChevronRight, Plus, Search, MessageSquare } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

// Define the types for our study groups
interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  meetingType: "online" | "in-person" | "hybrid";
  location?: string;
  meetingLink?: string;
  nextMeeting: string;
  time: string;
  maxParticipants: number;
  currentParticipants: number;
  organizer: {
    name: string;
    avatar: string;
  };
  tags: string[];
  joined: boolean;
}

export default function GroupStudyPage() {
  const { user } = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubject, setActiveSubject] = useState("All");
  const [meetingTypeFilter, setMeetingTypeFilter] = useState("All");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupSubject, setGroupSubject] = useState("");
  const [groupMeetingType, setGroupMeetingType] = useState<"online" | "in-person" | "hybrid">("online");
  const [groupLocation, setGroupLocation] = useState("");
  const [groupMeetingLink, setGroupMeetingLink] = useState("");
  const [groupNextMeeting, setGroupNextMeeting] = useState("");
  const [groupTime, setGroupTime] = useState("");
  const [groupMaxParticipants, setGroupMaxParticipants] = useState(5);
  const [groupTags, setGroupTags] = useState("");

  // Sample data for study groups
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([
    {
      id: "group-1",
      name: "Organic Chemistry Study Group",
      description: "Weekly sessions to discuss organic chemistry concepts, reaction mechanisms, and practice problems. All levels welcome!",
      subject: "Chemistry",
      meetingType: "hybrid",
      location: "Science Building, Room 305",
      meetingLink: "https://zoom.us/j/123456789",
      nextMeeting: "2024-07-10",
      time: "18:00-20:00",
      maxParticipants: 8,
      currentParticipants: 5,
      organizer: {
        name: "David Kim",
        avatar: "https://i.pravatar.cc/150?img=3"
      },
      tags: ["organic chemistry", "biochemistry", "pre-med"],
      joined: false
    },
    {
      id: "group-2",
      name: "Calculus II Study Sessions",
      description: "Getting through Calc II together. We focus on integrals, series, and parametric equations with weekly problem-solving sessions.",
      subject: "Mathematics",
      meetingType: "online",
      meetingLink: "https://meet.google.com/abc-defg-hij",
      nextMeeting: "2024-07-15",
      time: "19:00-21:00",
      maxParticipants: 6,
      currentParticipants: 6,
      organizer: {
        name: "Emma Johnson",
        avatar: "https://i.pravatar.cc/150?img=5"
      },
      tags: ["calculus", "mathematics", "engineering"],
      joined: true
    },
    {
      id: "group-3",
      name: "Python Programming Workshop",
      description: "Hands-on Python programming sessions for beginners and intermediate programmers. We build small projects together and review code.",
      subject: "Computer Science",
      meetingType: "in-person",
      location: "Tech Hub, Downtown Campus",
      nextMeeting: "2024-07-08",
      time: "17:00-19:00",
      maxParticipants: 10,
      currentParticipants: 7,
      organizer: {
        name: "Ryan Martinez",
        avatar: "https://i.pravatar.cc/150?img=8"
      },
      tags: ["python", "programming", "computer science"],
      joined: false
    },
    {
      id: "group-4",
      name: "MCAT Study Group",
      description: "Comprehensive MCAT preparation group. We rotate through all subjects and take practice tests together with detailed review sessions.",
      subject: "Pre-Med",
      meetingType: "hybrid",
      location: "Library Study Room 4",
      meetingLink: "https://zoom.us/j/987654321",
      nextMeeting: "2024-07-09",
      time: "17:30-20:30",
      maxParticipants: 5,
      currentParticipants: 4,
      organizer: {
        name: "Aisha Patel",
        avatar: "https://i.pravatar.cc/150?img=9"
      },
      tags: ["MCAT", "pre-med", "biology", "chemistry", "physics"],
      joined: false
    }
  ]);

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

  // Filter study groups based on search query, subject, and meeting type
  const filteredGroups = studyGroups.filter((group) => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject = activeSubject === "All" || group.subject === activeSubject;

    const matchesMeetingType = meetingTypeFilter === "All" ||
      (meetingTypeFilter === "Online" && group.meetingType === "online") ||
      (meetingTypeFilter === "In-Person" && group.meetingType === "in-person") ||
      (meetingTypeFilter === "Hybrid" && group.meetingType === "hybrid");

    return matchesSearch && matchesSubject && matchesMeetingType;
  });

  // Handle joining a group
  const handleJoinGroup = (groupId: string) => {
    setStudyGroups(studyGroups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          joined: !group.joined,
          currentParticipants: group.joined ?
            group.currentParticipants - 1 :
            group.currentParticipants + 1
        };
      }
      return group;
    }));
  };

  // Handle creating a new group
  const handleCreateGroup = () => {
    if (!groupName.trim() || !groupDescription.trim() || !groupSubject.trim()) return;

    const newGroup: StudyGroup = {
      id: `group-${Date.now()}`,
      name: groupName,
      description: groupDescription,
      subject: groupSubject,
      meetingType: groupMeetingType,
      location: groupLocation || undefined,
      meetingLink: groupMeetingLink || undefined,
      nextMeeting: groupNextMeeting,
      time: groupTime,
      maxParticipants: groupMaxParticipants,
      currentParticipants: 1, // Creator is automatically a participant
      organizer: {
        name: user?.fullName || 'Anonymous User',
        avatar: user?.imageUrl || "https://i.pravatar.cc/150?img=1"
      },
      tags: groupTags.split(',').map(tag => tag.trim()),
      joined: true
    };

    setStudyGroups([newGroup, ...studyGroups]);
    resetForm();
  };

  // Reset form fields
  const resetForm = () => {
    setGroupName("");
    setGroupDescription("");
    setGroupSubject("");
    setGroupMeetingType("online");
    setGroupLocation("");
    setGroupMeetingLink("");
    setGroupNextMeeting("");
    setGroupTime("");
    setGroupMaxParticipants(5);
    setGroupTags("");
    setShowCreateForm(false);
  };

  // Function to get meeting type badge styling
  const getMeetingTypeBadge = (type: "online" | "in-person" | "hybrid") => {
    switch (type) {
      case "online":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "in-person":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "hybrid":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      default:
        return "";
    }
  };

  return (
    <>
      <PageHeader
        title="Group Study"
        description="Connect with fellow students and study together"
      />

      <div className="mb-12">
        {/* Filters and search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          {/* Subject filters */}
          <div className="w-full md:w-auto overflow-x-auto">
            <div className="flex gap-2 pb-2 md:pb-0 min-w-max">
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setActiveSubject(subject)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeSubject === subject
                    ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search bar */}
            <div className="relative w-full md:w-72">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="search"
                className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-600 text-sm dark:text-gray-300 dark:placeholder-gray-500"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Meeting type filter */}
            <div className="relative">
              <select
                className="h-full pl-3 pr-10 py-2 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 text-sm text-gray-700 dark:text-gray-300 appearance-none"
                value={meetingTypeFilter}
                onChange={(e) => setMeetingTypeFilter(e.target.value)}
              >
                <option value="All">All Meetings</option>
                <option value="Online">Online</option>
                <option value="In-Person">In-Person</option>
                <option value="Hybrid">Hybrid</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <Filter className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Create group button/form */}
        <div className="mb-8">
          {!showCreateForm ? (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" /> Create New Study Group
            </Button>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create a New Study Group</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Group Name*
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-900 dark:text-white"
                    placeholder="Enter a name for your group"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject*
                  </label>
                  <select
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-900 dark:text-white"
                    value={groupSubject}
                    onChange={(e) => setGroupSubject(e.target.value)}
                  >
                    <option value="" disabled>Select a subject</option>
                    {subjects.filter(s => s !== "All").map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description*
                </label>
                <textarea
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-900 dark:text-white min-h-[100px]"
                  placeholder="Describe your study group's focus, goals, and who should join"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Meeting Type*
                  </label>
                  <select
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-900 dark:text-white"
                    value={groupMeetingType}
                    onChange={(e) => setGroupMeetingType(e.target.value as "online" | "in-person" | "hybrid")}
                  >
                    <option value="online">Online</option>
                    <option value="in-person">In-Person</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Next Meeting Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-900 dark:text-white"
                    value={groupNextMeeting}
                    onChange={(e) => setGroupNextMeeting(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Meeting Time
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-900 dark:text-white"
                    placeholder="e.g., 18:00-20:00"
                    value={groupTime}
                    onChange={(e) => setGroupTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {(groupMeetingType === "in-person" || groupMeetingType === "hybrid") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-900 dark:text-white"
                      placeholder="Where will you meet?"
                      value={groupLocation}
                      onChange={(e) => setGroupLocation(e.target.value)}
                    />
                  </div>
                )}

                {(groupMeetingType === "online" || groupMeetingType === "hybrid") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Meeting Link
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-900 dark:text-white"
                      placeholder="Zoom, Google Meet, etc."
                      value={groupMeetingLink}
                      onChange={(e) => setGroupMeetingLink(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Maximum Participants
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="20"
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-900 dark:text-white"
                    value={groupMaxParticipants}
                    onChange={(e) => setGroupMaxParticipants(parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-900 dark:text-white"
                    placeholder="e.g., calculus, math, engineering"
                    value={groupTags}
                    onChange={(e) => setGroupTags(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || !groupDescription.trim() || !groupSubject.trim()}
                >
                  Create Group
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Study groups list */}
        <div className="space-y-6">
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group) => (
              <div key={group.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300">
                          {group.subject}
                        </span>
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${getMeetingTypeBadge(group.meetingType)}`}>
                          {group.meetingType === "online" ? "Online" :
                            group.meetingType === "in-person" ? "In-Person" : "Hybrid"}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{group.name}</h3>
                    </div>

                    <Button
                      variant={group.joined ? "outline" : "default"}
                      className={group.joined ? "border-cyan-500 text-cyan-600 dark:border-cyan-700 dark:text-cyan-400" : ""}
                      onClick={() => handleJoinGroup(group.id)}
                      disabled={!group.joined && group.currentParticipants >= group.maxParticipants}
                    >
                      {group.joined ? "Leave Group" : (group.currentParticipants >= group.maxParticipants ? "Group Full" : "Join Group")}
                    </Button>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {group.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span>{group.nextMeeting ? new Date(group.nextMeeting).toLocaleDateString() : "TBD"}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span>{group.time || "TBD"}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span>{group.currentParticipants} / {group.maxParticipants} participants</span>
                    </div>
                  </div>

                  {(group.meetingType === "in-person" || group.meetingType === "hybrid") && group.location && (
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-4">
                      <MapPin className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span>{group.location}</span>
                    </div>
                  )}

                  {group.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {group.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={group.organizer.avatar}
                        alt={group.organizer.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {group.organizer.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Organizer
                        </p>
                      </div>
                    </div>

                    {group.joined && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-cyan-600 dark:text-cyan-400"
                        onClick={() => router.push(`/group-study/chat/${group.id}`)}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" /> Group Chat
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <Users className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No study groups found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try adjusting your search or filter criteria, or create your own study group!
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" /> Create New Study Group
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 
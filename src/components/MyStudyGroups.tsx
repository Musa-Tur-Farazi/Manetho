"use client";

import { useState, useEffect } from "react";
import { Calendar, Users, Clock, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

interface StudyGroup {
  groupId: string;
  name: string;
  description: string;
  meetingType: string;
  nextMeeting: string;
  meetingTime: string;
  currentParticipants: number;
  maxParticipants: number;
  subjectName: string;
  subjectColor: string;
  creatorName: string;
  creatorAvatar: string;
  memberRole: string;
  joinedAt: string;
}

export default function MyStudyGroups() {
  const router = useRouter();
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyGroups();
  }, []);

  const fetchMyGroups = async () => {
    try {
      const response = await fetch('/api/community/study-groups?type=my-groups');
      if (response.ok) {
        const data = await response.json();
        setMyGroups(data.groups || []);
      }
    } catch (error) {
      console.error('Error fetching my study groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupClick = (groupId: string) => {
    router.push(`/group-study/chat/${groupId}`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSubjectInitial = (subjectName: string) => {
    return subjectName ? subjectName.charAt(0).toUpperCase() : 'S';
  };

  const getSubjectColor = (color: string) => {
    if (color && color.startsWith('#')) {
      return `bg-[${color}]`;
    }
    // Fallback colors
    const colors = [
      'bg-gradient-to-r from-blue-500 to-purple-600',
      'bg-gradient-to-r from-red-500 to-pink-600',
      'bg-gradient-to-r from-yellow-500 to-orange-600',
      'bg-gradient-to-r from-green-500 to-emerald-600',
      'bg-gradient-to-r from-purple-500 to-indigo-600',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (loading) {
    return (
      <div className="text-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent mx-auto"></div>
      </div>
    );
  }

  if (myGroups.length === 0) {
    return (
      <div className="text-center py-6">
        <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-400">No study groups yet</p>
        <p className="text-xs text-slate-500 mt-1">Join some groups to see them here</p>
        <button
          onClick={() => router.push('/group-study')}
          className="mt-3 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Browse Groups
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {myGroups.map((group) => (
        <div
          key={group.groupId}
          onClick={() => handleGroupClick(group.groupId)}
          className="p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
        >
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 ${getSubjectColor(group.subjectColor)} rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0`}>
              {getSubjectInitial(group.subjectName)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-100 text-sm truncate">{group.name}</h4>
                  <p className="text-xs text-slate-500">{group.subjectName}</p>
                </div>
                <div className="flex items-center gap-1 text-slate-400 ml-2">
                  <div className={`w-2 h-2 rounded-full ${group.meetingType === 'online' ? 'bg-green-500' :
                      group.meetingType === 'in-person' ? 'bg-blue-500' : 'bg-purple-500'
                    }`}></div>
                  <span className="text-xs capitalize">{group.meetingType}</span>
                </div>
              </div>

              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Users className="w-3 h-3" />
                  <span>{group.currentParticipants}/{group.maxParticipants} members</span>
                </div>

                {group.nextMeeting && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(group.nextMeeting)}</span>
                  </div>
                )}

                {group.meetingTime && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{group.meetingTime}</span>
                  </div>
                )}
              </div>

              {group.memberRole === 'organizer' && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-900/30 text-emerald-300">
                    Organizer
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      <div className="pt-3 border-t border-slate-700/30">
        <button
          onClick={() => router.push('/group-study')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
        >
          <ExternalLink className="w-4 h-4" />
          Browse All Groups
        </button>
      </div>
    </div>
  );
} 
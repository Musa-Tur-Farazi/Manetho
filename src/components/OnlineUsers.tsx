"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Plus } from "lucide-react";

interface OnlineUser {
  userId: string;
  fullName: string;
  avatarUrl: string;
  lastActiveAt: string;
  status: string;
  currentActivity: string;
}

export default function OnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOnlineUsers = async () => {
    try {
      const response = await fetch('/api/community/users?type=online');
      if (response.ok) {
        const data = await response.json();
        setOnlineUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching online users:', error);
    } finally {
      setLoading(false);
    }
  };

  const startChat = async (userId: string) => {
    console.log('Starting chat with user:', userId);
  };

  const followUser = async (userId: string) => {
    try {
      const response = await fetch('/api/community/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: userId,
          action: 'follow',
        }),
      });

      if (response.ok) {
        console.log('Successfully followed user');
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent mx-auto"></div>
      </div>
    );
  }

  if (onlineUsers.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="w-8 h-8 bg-slate-700 rounded-full mx-auto mb-2 flex items-center justify-center">
          <div className="w-4 h-4 bg-slate-500 rounded-full"></div>
        </div>
        <p className="text-sm text-slate-400">No users online</p>
        <p className="text-xs text-slate-500 mt-1">Check back later</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {onlineUsers.map((user) => (
        <div
          key={user.userId}
          className="flex items-center gap-3 p-2 hover:bg-slate-800/30 rounded-lg transition-colors group"
        >
          <div className="relative">
            <img
              src={user.avatarUrl || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 50)}`}
              alt={user.fullName}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(user.status)} rounded-full border-2 border-slate-900`}></div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-100 truncate">{user.fullName}</p>
            <p className="text-xs text-slate-500 truncate">{user.currentActivity}</p>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => startChat(user.userId)}
              className="p-1 text-slate-400 hover:text-blue-400 hover:bg-blue-900/20 rounded transition-colors"
              title="Start chat"
            >
              <MessageCircle className="w-3 h-3" />
            </button>
            <button
              onClick={() => followUser(user.userId)}
              className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-emerald-900/20 rounded transition-colors"
              title="Follow user"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}

      {onlineUsers.length >= 10 && (
        <div className="pt-3 border-t border-slate-700/30">
          <button className="w-full text-center text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors">
            View All Online ({onlineUsers.length + 5}+)
          </button>
        </div>
      )}
    </div>
  );
} 
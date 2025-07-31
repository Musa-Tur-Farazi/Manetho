"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Plus, Search, User, GripVertical } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface ChatUser {
  userId: string;
  fullName: string;
  avatarUrl: string;
  lastMessageTime?: string;
  lastMessage?: string;
  isRead?: boolean;
  status?: string;
  currentActivity?: string;
  followedAt?: string;
}

interface DirectMessage {
  messageId: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
  senderName: string;
  senderAvatar: string;
}

export default function ChatSidebar() {
  const { user } = useUser();
  const router = useRouter();
  const [recentChats, setRecentChats] = useState<ChatUser[]>([]);
  const [followingUsers, setFollowingUsers] = useState<ChatUser[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Resizable sidebar state
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  // Fetch recent conversations and following users
  useEffect(() => {
    fetchRecentChats();
    fetchFollowingUsers();
  }, []);

  // Fetch messages when a chat is selected
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
    }
  }, [selectedChat]);

  // Search for users when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Handle resize functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && sidebarRef.current) {
        const newWidth = e.clientX;
        if (newWidth >= 200 && newWidth <= 500) {
          setSidebarWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const fetchRecentChats = async () => {
    try {
      const response = await fetch('/api/community/users?type=recent-chats');
      if (response.ok) {
        const data = await response.json();
        setRecentChats(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching recent chats:', error);
    }
  };

  const fetchFollowingUsers = async () => {
    try {
      const response = await fetch('/api/community/users?type=following');
      if (response.ok) {
        const data = await response.json();
        setFollowingUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching following users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (recipientId: string) => {
    try {
      const response = await fetch(`/api/community/direct-messages?recipientId=${recipientId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const searchUsers = async () => {
    try {
      const response = await fetch('/api/community/users?type=following');
      if (response.ok) {
        const data = await response.json();
        const filtered = data.users.filter((u: ChatUser) =>
          u.fullName.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const response = await fetch('/api/community/direct-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: selectedChat,
          content: newMessage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, {
          ...data.message,
          senderName: data.sender.fullName,
          senderAvatar: data.sender.avatarUrl,
        }]);
        setNewMessage("");
        fetchRecentChats(); // Refresh recent chats
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const visitProfile = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (selectedChat) {
    // Show chat interface
    const chatUser = recentChats.find(u => u.userId === selectedChat) ||
      followingUsers.find(u => u.userId === selectedChat) ||
      searchResults.find(u => u.userId === selectedChat);

    return (
      <div
        ref={sidebarRef}
        style={{ width: `${sidebarWidth}px` }}
        className="relative bg-slate-900/95 backdrop-blur-sm border-r border-slate-700/30 h-full flex flex-col"
      >
        {/* Resize Handle */}
        <div
          ref={resizeRef}
          onMouseDown={handleResizeStart}
          className={`absolute -right-1 top-0 bottom-0 w-2 cursor-col-resize z-10 ${isResizing ? 'bg-blue-500/50' : 'bg-transparent hover:bg-blue-500/20'
            } transition-colors duration-200`}
        >
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <GripVertical className="w-3 h-3 text-slate-400" />
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex flex-col h-full">
          {/* Chat Header */}
          <div className="flex items-center gap-3 p-3 border-b border-slate-700/30">
            <button
              onClick={() => setSelectedChat(null)}
              className="text-slate-400 hover:text-slate-200 text-sm cursor-pointer"
            >
              ← Back
            </button>
            {chatUser && (
              <>
                <img
                  src={chatUser.avatarUrl || "https://i.pravatar.cc/150?img=1"}
                  alt={chatUser.fullName}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-100">{chatUser.fullName}</p>
                  <p className="text-xs text-slate-500">Learning Partner</p>
                </div>
                <button
                  onClick={() => visitProfile(chatUser.userId)}
                  className="p-1 text-slate-400 hover:text-slate-200 rounded transition-colors cursor-pointer"
                  title="Visit profile"
                >
                  <User className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
            {messages.map((message) => {
              const isOwn = message.senderId === user?.id; // Note: may need to adjust this based on your user ID structure
              return (
                <div key={message.messageId} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-2 rounded-lg ${isOwn
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-800/40 text-slate-100'
                    }`}>
                    <p className="text-sm break-words overflow-hidden">{message.content}</p>
                    <p className="text-xs opacity-75 mt-1">{formatTime(message.timestamp)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Input */}
          <div className="p-3 border-t border-slate-700/30">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-slate-800/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100 placeholder-slate-400"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show chat list
  return (
    <div
      ref={sidebarRef}
      style={{ width: `${sidebarWidth}px` }}
      className="relative bg-slate-900/95 backdrop-blur-sm border-r border-slate-700/30 h-full flex flex-col"
    >
      {/* Resize Handle */}
      <div
        ref={resizeRef}
        onMouseDown={handleResizeStart}
        className={`absolute -right-1 top-0 bottom-0 w-2 cursor-col-resize z-10 ${isResizing ? 'bg-blue-500/50' : 'bg-transparent hover:bg-blue-500/20'
          } transition-colors duration-200`}
      >
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <GripVertical className="w-3 h-3 text-slate-400" />
        </div>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search learning partners..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100 placeholder-slate-400"
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400 font-medium">Search Results</p>
            {searchResults.map((user) => (
              <div
                key={user.userId}
                className="flex items-center gap-3 p-2 hover:bg-slate-800/30 rounded-lg transition-colors group"
              >
                <img
                  src={user.avatarUrl || "https://i.pravatar.cc/150?img=1"}
                  alt={user.fullName}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-100">{user.fullName}</p>
                  <p className="text-xs text-slate-500">Learning Partner</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => router.push(`/chat?with=${user.userId}`)}
                    className="p-1 text-slate-400 hover:text-blue-400 rounded transition-colors cursor-pointer"
                    title="Start chat"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => visitProfile(user.userId)}
                    className="p-1 text-slate-400 hover:text-purple-400 rounded transition-colors cursor-pointer"
                    title="Visit profile"
                  >
                    <User className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Learning Partners (Following) */}
        {loading ? (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mx-auto"></div>
          </div>
        ) : followingUsers.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs text-slate-400 font-medium">Learning Partners</p>
            {followingUsers.map((user) => (
              <div
                key={user.userId}
                className="flex items-center gap-3 p-2 hover:bg-slate-800/30 rounded-lg transition-colors group"
              >
                <img
                  src={user.avatarUrl || "https://i.pravatar.cc/150?img=1"}
                  alt={user.fullName}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-100 truncate">{user.fullName}</p>
                  <p className="text-xs text-slate-500">Active learning partner</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => router.push(`/chat?with=${user.userId}`)}
                    className="p-1 text-slate-400 hover:text-blue-400 rounded transition-colors cursor-pointer"
                    title="Start chat"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => visitProfile(user.userId)}
                    className="p-1 text-slate-400 hover:text-purple-400 rounded transition-colors cursor-pointer"
                    title="Visit profile"
                  >
                    <User className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <User className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No learning partners yet</p>
            <p className="text-xs text-slate-500 mt-1">Follow users to see them here</p>
          </div>
        )}

        {/* Recent Conversations */}
        {recentChats.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-slate-700/30">
            <p className="text-xs text-slate-400 font-medium">Recent Conversations</p>
            {recentChats.slice(0, 3).map((chat) => (
              <div
                key={chat.userId}
                onClick={() => router.push(`/chat?with=${chat.userId}`)}
                className="flex items-start gap-3 p-2 hover:bg-slate-800/30 rounded-lg cursor-pointer transition-colors group"
              >
                <img
                  src={chat.avatarUrl || "https://i.pravatar.cc/150?img=1"}
                  alt={chat.fullName}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-100 truncate">{chat.fullName}</p>
                    {chat.lastMessageTime && (
                      <p className="text-xs text-slate-500">{formatTime(chat.lastMessageTime)}</p>
                    )}
                  </div>
                  {chat.lastMessage && (
                    <p className="text-xs text-slate-500 truncate">{chat.lastMessage}</p>
                  )}
                </div>
                {!chat.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
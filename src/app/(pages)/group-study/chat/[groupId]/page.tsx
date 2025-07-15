"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import { Send, ArrowLeft, Paperclip, Users, Clock, MapPin } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { pusherClient } from "@/lib/pusher-client";
import { getGroupChatChannel } from "@/lib/chat";

interface GroupMessage {
  messageId: string;
  groupId: string;
  senderId: string;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  timestamp: string;
  senderName: string;
  senderAvatar: string;
}

interface GroupMember {
  userId: string;
  fullName: string;
  avatarUrl: string;
  lastActiveAt: string | null;
  role: string;
  joinedAt: string;
  isOnline: boolean;
  isCurrentUser: boolean;
}

interface GroupInfo {
  groupId: string;
  name: string;
  description: string;
  meetingType: string;
  location: string | null;
  meetingLink: string | null;
  nextMeeting: string | null;
  meetingTime: string | null;
  maxParticipants: number;
  currentParticipants: number;
  tags: string[] | null;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  creatorName: string;
  creatorAvatar: string;
  subjectName: string | null;
  subjectColor: string | null;
  onlineMembersCount: number;
  userRole: string;
  isCreator: boolean;
}

export default function GroupChatPage() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const groupId = params.groupId as string;

  // State
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMembers, setShowMembers] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch group info, members, and messages
  useEffect(() => {
    if (groupId) {
      fetchGroupData();
    }
  }, [groupId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Set up real-time messaging
  useEffect(() => {
    if (!groupId) return;

    const channelName = getGroupChatChannel(groupId);
    const channel = pusherClient.subscribe(channelName);

    const handleNewMessage = (payload: GroupMessage) => {
      setMessages(prev => [...prev, payload]);
      scrollToBottom();
    };

    channel.bind('message:new', handleNewMessage);

    return () => {
      channel.unbind('message:new', handleNewMessage);
      pusherClient.unsubscribe(channelName);
    };
  }, [groupId]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchGroupData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch group info, members, and messages in parallel
      const [groupRes, membersRes, messagesRes] = await Promise.all([
        fetch(`/api/community/study-groups/${groupId}`),
        fetch(`/api/community/study-groups/${groupId}/members`),
        fetch(`/api/community/study-groups/messages?groupId=${groupId}&limit=50`)
      ]);

      if (!groupRes.ok) {
        const error = await groupRes.json();
        throw new Error(error.error || 'Failed to fetch group info');
      }

      if (!membersRes.ok) {
        const error = await membersRes.json();
        throw new Error(error.error || 'Failed to fetch members');
      }

      if (!messagesRes.ok) {
        const error = await messagesRes.json();
        throw new Error(error.error || 'Failed to fetch messages');
      }

      const [groupData, membersData, messagesData] = await Promise.all([
        groupRes.json(),
        membersRes.json(),
        messagesRes.json()
      ]);

      setGroupInfo(groupData.group);
      setMembers(membersData.members || []);
      setMessages(messagesData.messages || []);

    } catch (error) {
      console.error('Error fetching group data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load group data');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!messageText.trim() || sendingMessage) return;

    try {
      setSendingMessage(true);

      const response = await fetch('/api/community/study-groups/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId,
          content: messageText.trim(),
        }),
      });

      if (response.ok) {
        setMessageText("");
        // Message will be added via real-time event
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const formatMeetingDate = (dateString: string | null) => {
    if (!dateString) return "TBD";
    try {
      return new Date(dateString).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return "TBD";
    }
  };

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

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Group Chat"
          description="Loading group information..."
        />
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader
          title="Group Chat"
          description="Error loading group"
        />
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">{error}</div>
          <Button onClick={() => router.push('/group-study')}>
            Back to Groups
          </Button>
        </div>
      </>
    );
  }

  if (!groupInfo) {
    return (
      <>
        <PageHeader
          title="Group Chat"
          description="Group not found"
        />
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">Group not found</div>
          <Button onClick={() => router.push('/group-study')}>
            Back to Groups
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={groupInfo.name}
        description={`${groupInfo.subjectName || 'Study Group'} • ${members.length} members`}
      />

      <div className="max-w-6xl mx-auto">
        {/* Chat Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/group-study')}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {groupInfo.name}
                  </h1>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getMeetingTypeBadge(groupInfo.meetingType)}`}>
                    {groupInfo.meetingType === "online" ? "Online" :
                      groupInfo.meetingType === "in-person" ? "In-Person" : "Hybrid"}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  {groupInfo.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  {groupInfo.nextMeeting && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Next: {formatMeetingDate(groupInfo.nextMeeting)}</span>
                      {groupInfo.meetingTime && <span>• {groupInfo.meetingTime}</span>}
                    </div>
                  )}

                  {groupInfo.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{groupInfo.location}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{groupInfo.onlineMembersCount} online • {members.length} total</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowMembers(!showMembers)}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Members ({members.length})
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Messages Section */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
              {/* Messages Container */}
              <div className="h-[600px] overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400 mb-4">
                      No messages yet. Start the conversation!
                    </div>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isCurrentUser = message.senderId === user?.publicMetadata?.userId;

                    return (
                      <div key={message.messageId} className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        <img
                          src={message.senderAvatar || 'https://i.pravatar.cc/150?img=1'}
                          alt={message.senderName}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />

                        <div className={`flex-1 max-w-[70%] ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-sm font-medium text-gray-900 dark:text-white ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                              {isCurrentUser ? 'You' : message.senderName}
                            </span>
                            <span className={`text-xs text-gray-500 dark:text-gray-400 ${isCurrentUser ? 'order-1' : 'order-2'}`}>
                              {formatMessageTime(message.timestamp)}
                            </span>
                          </div>

                          <div className={`inline-block px-4 py-2 rounded-2xl ${isCurrentUser
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white'
                            }`}>
                            {message.content && (
                              <p className="whitespace-pre-wrap break-words">
                                {message.content}
                              </p>
                            )}

                            {message.fileUrl && (
                              <div className="mt-2">
                                <a
                                  href={message.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${isCurrentUser
                                    ? 'bg-emerald-600 hover:bg-emerald-700'
                                    : 'bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500'
                                    } transition-colors`}
                                >
                                  <Paperclip className="w-4 h-4" />
                                  <span className="text-sm">{message.fileName || 'File'}</span>
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 dark:border-slate-700 p-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    onChange={(e) => {
                      // TODO: Implement file upload
                      console.log('File upload to be implemented', e.target.files);
                    }}
                  />

                  <div className="flex-1 relative">
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 dark:text-white resize-none"
                      rows={1}
                      style={{ maxHeight: '120px' }}
                    />
                  </div>

                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendingMessage}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    {sendingMessage ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Members Sidebar */}
          <div className={`lg:col-span-1 ${showMembers ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Members ({members.length})
              </h3>

              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.userId} className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={member.avatarUrl || 'https://i.pravatar.cc/150?img=1'}
                        alt={member.fullName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      {member.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {member.isCurrentUser ? 'You' : member.fullName}
                        </span>
                        {member.role === 'organizer' && (
                          <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full">
                            Organizer
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {member.isOnline ? 'Online' : 'Offline'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 
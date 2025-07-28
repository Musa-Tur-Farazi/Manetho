'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/Button';
import {
  Users,
  Send,
  ArrowLeft,
  FileText,
  Image,
  Download,
  Video,
  Plus,
  Copy,
  ExternalLink,
  Link,
  Trash2,
  CheckCircle,
  FolderOpen,
  Upload,
  MessageSquare
} from 'lucide-react';
import { pusherClient } from '@/lib/pusher-client';
import { getGroupChatChannel } from '@/lib/chat';

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
  senderAvatar: string | null;
}

interface GroupMember {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  lastActiveAt: string | null;
  role: 'member' | 'organizer';
  joinedAt: string;
  isOnline: boolean;
  isCurrentUser: boolean;
}

interface GroupInfo {
  groupId: string;
  name: string;
  description: string;
  meetingType: 'online' | 'in-person' | 'hybrid';
  location: string | null;
  meetingLink: string | null;
  nextMeeting: string | null;
  meetingTime: string | null;
  maxParticipants: number;
  currentParticipants: number;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  creatorName: string;
  creatorAvatar: string | null;
  subjectName: string | null;
  subjectColor: string | null;
  onlineMembersCount: number;
  userRole: 'member' | 'organizer';
  isCreator: boolean;
}

interface MeetingLink {
  linkId: string;
  platform: string;
  url: string;
  createdAt: string;
  isActive: boolean;
  creatorName: string;
  creatorAvatar: string | null;
}

interface SharedResource {
  resourceId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  description: string | null;
  uploadedAt: string;
  uploaderName: string;
  uploaderAvatar: string | null;
}

export default function GroupStudyChatPage() {
  // Enhanced CSS for modern chat design
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Simplified Chat Styles */
      .chat-container {
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        min-height: 100vh;
      }
      
      .dark .chat-container {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      }
      
      .messages-container {
        height: 100%;
        max-height: calc(100vh - 105px);
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: thin;
        scrollbar-color: rgba(59, 130, 246, 0.3) transparent;
      }
      
      .messages-container::-webkit-scrollbar {
        width: 8px;
      }
      
      .messages-container::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .messages-container::-webkit-scrollbar-thumb {
        background-color: rgba(59, 130, 246, 0.3);
        border-radius: 10px;
      }
      
      .messages-container::-webkit-scrollbar-thumb:hover {
        background-color: rgba(59, 130, 246, 0.5);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const { userId } = useAuth();
  const router = useRouter();
  const params = useParams();
  const groupId = params.groupId as string;

  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [meetingLinks, setMeetingLinks] = useState<MeetingLink[]>([]);
  const [sharedResources, setSharedResources] = useState<SharedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [showMeetingOptions, setShowMeetingOptions] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [resourceDescription, setResourceDescription] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (groupId && userId) {
      fetchGroupInfo();
      fetchMessages();
      fetchMembers();
      fetchMeetingLinks();
      fetchSharedResources();
      setupPusherSubscription();
    }

    return () => {
      // Clean up Pusher subscription
      if (groupId) {
        pusherClient.unsubscribe(getGroupChatChannel(groupId));
      }
    };
  }, [groupId, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupPusherSubscription = () => {
    const channel = pusherClient.subscribe(getGroupChatChannel(groupId));

    channel.bind('message:new', (data: GroupMessage) => {
      setMessages(prev => [...prev, data]);
    });

    channel.bind('user:typing', () => {
      // Handle typing indicators if needed
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(getGroupChatChannel(groupId));
    };
  };

  const fetchGroupInfo = async () => {
    try {
      const response = await fetch(`/api/community/study-groups/${groupId}`);
      const data = await response.json();

      if (response.ok) {
        setGroupInfo(data.group);
      } else {
        console.error('Error fetching group info:', data.error);
        router.push('/group-study');
      }
    } catch (error) {
      console.error('Error fetching group info:', error);
      router.push('/group-study');
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/community/study-groups/messages?groupId=${groupId}&limit=50`);
      const data = await response.json();

      if (response.ok) {
        setMessages(data.messages || []);
      } else {
        console.error('Error fetching messages:', data.error);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/community/study-groups/${groupId}/members`);
      const data = await response.json();

      if (response.ok) {
        setMembers(data.members || []);
      } else {
        console.error('Error fetching members:', data.error);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchMeetingLinks = async () => {
    try {
      const response = await fetch(`/api/community/study-groups/${groupId}/meeting-links`);
      const data = await response.json();

      if (response.ok) {
        setMeetingLinks(data.meetingLinks || []);
      } else {
        console.error('Error fetching meeting links:', data.error);
      }
    } catch (error) {
      console.error('Error fetching meeting links:', error);
    }
  };

  const fetchSharedResources = async () => {
    try {
      const response = await fetch(`/api/community/study-groups/${groupId}/shared-resources`);
      const data = await response.json();

      if (response.ok) {
        setSharedResources(data.sharedResources || []);
      } else {
        console.error('Error fetching shared resources:', data.error);
      }
    } catch (error) {
      console.error('Error fetching shared resources:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleProfileClick = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim()) return;

    const messageText = messageInput.trim();
    setMessageInput('');

    try {
      const response = await fetch('/api/community/study-groups/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId,
          content: messageText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error sending message:', data.error);
        setMessageInput(messageText); // Restore message if failed
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessageInput(messageText); // Restore message if failed
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simple file upload simulation - in a real app, you'd upload to a storage service
    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (uploadResponse.ok) {
        const response = await fetch('/api/community/study-groups/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            groupId,
            content: '',
            files: [{
              url: uploadData.url,
              name: file.name,
              type: file.type,
              size: file.size,
            }],
          }),
        });

        if (!response.ok) {
          console.error('Error sending file message');
        }
      } else {
        console.error('Error uploading file:', uploadData.error);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSharedResourceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simple file upload simulation - in a real app, you'd upload to a storage service
    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (uploadResponse.ok) {
        const response = await fetch(`/api/community/study-groups/${groupId}/shared-resources`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: file.name,
            fileUrl: uploadData.url,
            fileType: file.type,
            fileSize: file.size,
            description: resourceDescription.trim() || null,
          }),
        });

        if (response.ok) {
          await fetchSharedResources();
          setResourceDescription('');
          setShowUploadOptions(false);
        } else {
          const errorData = await response.json();
          console.error('Error uploading shared resource:', errorData);
        }
      } else {
        console.error('Error uploading file to storage:', uploadData.error);
      }
    } catch (error) {
      console.error('Error uploading shared resource:', error);
    }

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };



  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <FileText className="w-4 h-4" />;

    if (fileType.startsWith('image/')) {
      return <Image className="w-4 h-4" alt="Image file" />;
    }

    return <FileText className="w-4 h-4" />;
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'google':
        return <Video className="w-4 h-4 text-blue-600" />;
      case 'zoom':
        return <Video className="w-4 h-4 text-blue-500" />;
      default:
        return <Link className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'google':
        return 'Google Meet';
      case 'zoom':
        return 'Zoom';
      default:
        return 'Custom Link';
    }
  };



  // Get current user's internal ID from the members list
  const getCurrentUserInternalId = () => {
    const currentMember = members.find(member => member.isCurrentUser);
    return currentMember?.userId || '';
  };

  const generateMeetingLink = async (platform: 'google' | 'zoom') => {
    try {
      if (platform === 'google') {
        // Open Google Meet in a new tab for manual creation
        window.open('https://meet.google.com/new', '_blank');
        return;
      } else if (platform === 'zoom') {
        // Open Zoom in a new tab for manual creation
        window.open('https://zoom.us/start/webmeeting', '_blank');
        return;
      }
    } catch (error) {
      console.error('Error opening meeting platform:', error);
    }
  };

  const createMeetingLink = async (platform: string, url: string) => {
    try {
      const response = await fetch(`/api/community/study-groups/${groupId}/meeting-links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          url,
        }),
      });

      if (response.ok) {
        await fetchMeetingLinks();
        setShowMeetingOptions(false);
      } else {
        console.error('Failed to create meeting link');
      }
    } catch (error) {
      console.error('Error creating meeting link:', error);
    }
  };

  const deleteMeetingLink = async (linkId: string) => {
    try {
      const response = await fetch(`/api/community/study-groups/${groupId}/meeting-links`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkId,
        }),
      });

      if (response.ok) {
        await fetchMeetingLinks();
      } else {
        console.error('Failed to delete meeting link');
      }
    } catch (error) {
      console.error('Error deleting meeting link:', error);
    }
  };

  const copyMeetingLink = (url: string, linkId: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLinkId(linkId);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  const [meetingLinkInput, setMeetingLinkInput] = useState('');
  const sharedResourceInputRef = useRef<HTMLInputElement>(null);

  const deleteSharedResource = async (resourceId: string) => {
    try {
      const response = await fetch(`/api/community/study-groups/${groupId}/shared-resources`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resourceId,
        }),
      });

      if (response.ok) {
        await fetchSharedResources();
      } else {
        console.error('Failed to delete shared resource');
      }
    } catch (error) {
      console.error('Error deleting shared resource:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      </div>
    );
  }

  if (!groupInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Group Not Found</h1>
          <Button onClick={() => router.push('/group-study')}>
            Back to Study Groups
          </Button>
        </div>
      </div>
    );
  }

  const currentUserInternalId = getCurrentUserInternalId();

  return (
    <div className="chat-container h-screen flex flex-col">
      {/* Simplified Header */}
      <div className="flex-shrink-0 px-3 py-2 bg-white/95 dark:bg-slate-900/95 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/group-study')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                {groupInfo.name}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                {groupInfo.subjectName && (
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: `${groupInfo.subjectColor || '#667eea'}20`, color: groupInfo.subjectColor || '#667eea' }}
                  >
                    {groupInfo.subjectName}
                  </span>
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {members.length} members
                </span>
              </div>
            </div>
          </div>

          {/* Meeting Links Section - Moved to top right */}
          {groupInfo.meetingType === 'online' && (
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <Video className="w-3 h-3 text-blue-500" />
                <span className="hidden sm:inline">Meeting Links ({meetingLinks.length})</span>
                <span className="sm:hidden">Links ({meetingLinks.length})</span>
              </div>

              {meetingLinks.length > 0 ? (
                <div className="flex items-center gap-1">
                  {meetingLinks.slice(0, 2).map((link, index) => (
                    <div key={link.linkId} className={`flex items-center gap-1 ${index > 0 ? 'hidden sm:flex' : ''}`}>
                      <Button
                        onClick={() => window.open(link.url, '_blank')}
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 h-6 text-xs"
                        size="sm"
                        title={`Join ${getPlatformName(link.platform)}`}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">{getPlatformName(link.platform)}</span>
                        <span className="sm:hidden">Join</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => copyMeetingLink(link.url, link.linkId)}
                        size="sm"
                        title="Copy link"
                        className="px-1 py-1 h-6"
                      >
                        {copiedLinkId === link.linkId ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  ))}
                  {meetingLinks.length > 2 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      <span className="hidden sm:inline">+{meetingLinks.length - 2} more</span>
                      <span className="sm:hidden">+{meetingLinks.length - 1} more</span>
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs text-gray-500 dark:text-gray-400">No links yet</span>
              )}

              {groupInfo.userRole === 'organizer' && (
                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={() => setShowMeetingOptions(!showMeetingOptions)}
                    size="sm"
                    className="h-6 px-2"
                    title="Manage meeting links"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>

                  {showMeetingOptions && (
                    <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 min-w-[320px] max-w-[400px]">
                      <div className="p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Meeting Links</h4>

                        {/* Show all links in dropdown */}
                        <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                          {meetingLinks.map((link) => (
                            <div key={link.linkId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {getPlatformIcon(link.platform)}
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                                    {getPlatformName(link.platform)}
                                  </span>
                                  <p
                                    className="text-xs text-blue-600 dark:text-blue-400 truncate cursor-pointer"
                                    onClick={() => window.open(link.url, '_blank')}
                                    title={link.url}
                                  >
                                    {link.url}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  onClick={() => window.open(link.url, '_blank')}
                                  className="bg-green-500 hover:bg-green-600 text-white px-2 py-0.5 h-6 text-xs"
                                  size="sm"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => copyMeetingLink(link.url, link.linkId)}
                                  size="sm"
                                  title="Copy link"
                                  className="px-1 py-0.5 h-6"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => deleteMeetingLink(link.linkId)}
                                  size="sm"
                                  title="Delete link"
                                  className="text-red-500 hover:text-red-600 px-1 py-0.5 h-6"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          {meetingLinks.length === 0 && (
                            <div className="text-center py-2 text-gray-500 dark:text-gray-400 text-xs">
                              No meeting links yet
                            </div>
                          )}
                        </div>

                        <div className="border-t pt-3">
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Add New Link</h5>
                          <div className="space-y-2 mb-3">
                            <Button
                              variant="ghost"
                              onClick={() => generateMeetingLink('google')}
                              className="w-full justify-start"
                            >
                              <Video className="w-4 h-4 mr-2 text-blue-600" />
                              Google Meet
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => generateMeetingLink('zoom')}
                              className="w-full justify-start"
                            >
                              <Video className="w-4 h-4 mr-2 text-blue-500" />
                              Zoom Meeting
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="url"
                              value={meetingLinkInput}
                              onChange={(e) => setMeetingLinkInput(e.target.value)}
                              placeholder="Paste meeting link..."
                              className="flex-1 px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                            />
                            <Button
                              onClick={() => {
                                if (meetingLinkInput.trim()) {
                                  createMeetingLink('custom', meetingLinkInput.trim());
                                  setMeetingLinkInput('');
                                }
                              }}
                              disabled={!meetingLinkInput.trim()}
                              size="sm"
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex min-h-0">
        {/* Members Sidebar - Now shown on the left */}
        {showMembers && (
          <div className="w-64 bg-white/95 dark:bg-gray-800/95 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Members Section */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4" />
                Members ({members.length})
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {members.map((member) => (
                <div key={member.userId} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <button
                    onClick={() => handleProfileClick(member.userId, member.fullName)}
                    className="relative"
                  >
                    <img
                      src={member.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.fullName)}&background=667eea&color=fff`}
                      alt={member.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    {member.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => handleProfileClick(member.userId, member.fullName)}
                      className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate block w-full text-left"
                    >
                      {member.fullName}
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {member.role === 'organizer' ? 'Organizer' : 'Member'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Shared Resources Section */}
            <div className="border-t border-gray-200 dark:border-gray-700">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Shared Resources ({sharedResources.length})
                </h3>
              </div>
              <div className="max-h-64 overflow-y-auto p-3 space-y-2">
                {sharedResources.map((resource) => (
                  <div key={resource.resourceId} className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      {getFileIcon(resource.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => window.open(resource.fileUrl, '_blank')}
                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate block w-full text-left"
                        title={resource.fileName}
                      >
                        {resource.fileName}
                      </button>
                      {resource.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 truncate" title={resource.description}>
                          {resource.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {resource.uploaderName}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {Math.round(resource.fileSize / 1024)} KB
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => window.open(resource.fileUrl, '_blank')}
                        className="p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Download"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                      {(groupInfo?.userRole === 'organizer' || members.find(m => m.isCurrentUser)?.fullName === resource.uploaderName) && (
                        <button
                          onClick={() => deleteSharedResource(resource.resourceId)}
                          className="p-1 text-red-500 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {sharedResources.length === 0 && (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-xs">
                    No shared resources yet
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="messages-container p-4 space-y-4 bg-white/30 dark:bg-slate-950/30">
            {messages.map((message, index) => {
              const isOwn = message.senderId === currentUserInternalId;
              const showDate = index === 0 || formatMessageDate(messages[index - 1]?.timestamp) !== formatMessageDate(message.timestamp);

              return (
                <div key={message.messageId} className="w-full">
                  {/* Date separator */}
                  {showDate && (
                    <div className="flex justify-center my-6">
                      <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-4 py-2 rounded-full">
                        {formatMessageDate(message.timestamp)}
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-6 w-full`}>
                    <div className={`max-w-[70%] ${isOwn ? 'flex flex-col items-end' : 'flex items-start gap-3'}`}>
                      {!isOwn && (
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => handleProfileClick(message.senderId, message.senderName)}
                            className="hover:scale-110 transition-transform duration-300"
                          >
                            <img
                              src={message.senderAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.senderName)}&background=667eea&color=fff`}
                              alt={message.senderName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          </button>
                        </div>
                      )}

                      <div className="flex-1 min-w-0 max-w-full">
                        {/* Sender name and time */}
                        <div className={`flex items-center gap-2 mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <button
                            onClick={() => handleProfileClick(message.senderId, message.senderName)}
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                          >
                            {isOwn ? 'You' : message.senderName}
                          </button>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatMessageTime(message.timestamp)}
                          </span>
                        </div>

                        {message.content && (
                          <div className={`p-4 rounded-2xl ${isOwn
                            ? 'bg-blue-500 text-white rounded-br-md'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md shadow-sm border border-gray-100 dark:border-gray-700'
                            }`}>
                            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed overflow-wrap-anywhere">{message.content}</p>
                          </div>
                        )}

                        {message.fileUrl && (
                          <div className={`p-4 mt-2 rounded-2xl ${isOwn
                            ? 'bg-blue-500 text-white rounded-br-md'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md shadow-sm border border-gray-100 dark:border-gray-700'
                            }`}>
                            <div className={`flex items-center gap-3 p-3 rounded-lg ${isOwn
                              ? 'bg-blue-400/20'
                              : 'bg-gray-100 dark:bg-gray-700'
                              }`}>
                              <div className="flex-shrink-0">
                                <span className={isOwn ? 'text-white' : 'text-gray-600 dark:text-gray-300'}>
                                  {getFileIcon(message.fileType)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${isOwn ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                  {message.fileName}
                                </p>
                                {message.fileSize && (
                                  <p className={`text-xs ${isOwn ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {Math.round(message.fileSize / 1024)} KB
                                  </p>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(message.fileUrl!, '_blank')}
                                className={`flex-shrink-0 ${isOwn
                                  ? 'bg-white/20 border-white/30 text-white hover:bg-white/30'
                                  : 'bg-gray-100 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600'
                                  }`}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 bg-white/95 dark:bg-gray-800/95 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <input
                type="file"
                ref={sharedResourceInputRef}
                onChange={handleSharedResourceUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUploadOptions(!showUploadOptions)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Upload options"
                >
                  <Plus className="w-5 h-5" />
                </button>

                {showUploadOptions && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 min-w-[200px]">
                    <div className="p-3">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Upload Options</h4>
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            fileInputRef.current?.click();
                            setShowUploadOptions(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Message File
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowUploadOptions(false);
                            // Show shared resource upload modal
                            const modal = document.getElementById('sharedResourceModal');
                            if (modal) modal.style.display = 'flex';
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        >
                          <FolderOpen className="w-4 h-4" />
                          Shared Resource
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="p-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-full transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>

            {/* Shared Resource Upload Modal */}
            <div
              id="sharedResourceModal"
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  e.currentTarget.style.display = 'none';
                }
              }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Upload Shared Resource
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={resourceDescription}
                      onChange={(e) => setResourceDescription(e.target.value)}
                      placeholder="Describe this resource..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        sharedResourceInputRef.current?.click();
                        document.getElementById('sharedResourceModal')!.style.display = 'none';
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Choose File
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setResourceDescription('');
                        document.getElementById('sharedResourceModal')!.style.display = 'none';
                      }}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
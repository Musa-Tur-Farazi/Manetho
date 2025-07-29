"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Send,
  Search,
  Phone,
  Video,
  ChevronLeft,
  MessageCircle,
  Check,
  CheckCheck,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Copy,
  CheckCircle,
  Trash2,
  Plus
} from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';
import { downloadFile } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { pusherClient } from '@/lib/pusher-client';
import { getChatChannel } from '@/lib/chat';

interface ChatUser {
  userId: string;
  fullName: string;
  avatarUrl: string;
  lastActiveAt?: string;
  isOnline?: boolean;
}

interface DirectMessage {
  messageId: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  senderName: string;
  senderAvatar: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

interface FileUpload {
  file: File;
  preview?: string;
}

export default function ChatPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get chat parameter from URL
  const chatUserId = searchParams.get('with');

  // State management
  const [recentChats, setRecentChats] = useState<ChatUser[]>([]);
  const [followingUsers, setFollowingUsers] = useState<ChatUser[]>([]);
  const [unknownUsers, setUnknownUsers] = useState<ChatUser[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(chatUserId);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileUpload[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUserInternalId, setCurrentUserInternalId] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(320); // Default 320px (w-80)
  const [isResizing, setIsResizing] = useState(false);
  const [lastActiveUpdate, setLastActiveUpdate] = useState(Date.now());

  // Meeting functionality - no call states needed

  // Meeting links state (similar to group chat)
  const [meetingLinks, setMeetingLinks] = useState<Array<{
    linkId: string;
    platform: string;
    url: string;
    createdAt: string;
    isActive: boolean;
    createdBy: string;
    creatorName: string;
    creatorAvatar: string;
  }>>([]);
  const [showMeetingOptions, setShowMeetingOptions] = useState(false);
  const [meetingLinkInput, setMeetingLinkInput] = useState('');
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [isLoadingMeetingLinks, setIsLoadingMeetingLinks] = useState(false);

  // Meeting functionality - no incoming call states needed

  // Google Meet integration - no configuration needed

  // Pusher subscription for real-time messages
  useEffect(() => {
    if (!currentUserInternalId || !selectedChat) return;

    const channelName = getChatChannel(currentUserInternalId, selectedChat);
    const channel = pusherClient.subscribe(channelName);

    const handleNewMessage = (payload: DirectMessage) => {
      // Avoid duplicate if we already added our own message optimistically
      if (payload.senderId === currentUserInternalId) return;
      setMessages(prev => [...prev, payload]);
      setShouldAutoScroll(true);
    };

    channel.bind('message:new', handleNewMessage);

    return () => {
      channel.unbind('message:new', handleNewMessage);
      pusherClient.unsubscribe(channelName);
    };
  }, [currentUserInternalId, selectedChat]);

  // Google Meet integration - no channel name generation needed

  // Meeting Links Functions (similar to group chat)
  const fetchMeetingLinks = async () => {
    if (!selectedUser?.userId) {
      console.log('⚠️ Cannot fetch meeting links: selectedUser not available');
      return;
    }

    try {
      setIsLoadingMeetingLinks(true);
      console.log('📞 Fetching meeting links for user:', selectedUser.fullName, selectedUser.userId);

      const response = await fetch(`/api/direct-chat/meeting-links?otherUserId=${selectedUser.userId}`);
      const data = await response.json();

      if (response.ok) {
        const previousCount = meetingLinks.length;
        const newCount = data.meetingLinks?.length || 0;

        setMeetingLinks(data.meetingLinks || []);

        if (newCount !== previousCount) {
          console.log('🔄 Meeting links updated:', previousCount, '→', newCount);
        }

        console.log('✅ Meeting links synced:', newCount, 'active meetings');
      } else {
        console.error('❌ Error fetching meeting links:', data.error);
      }
    } catch (error) {
      console.error('❌ Network error fetching meeting links:', error);
    } finally {
      setIsLoadingMeetingLinks(false);
    }
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
    if (!selectedUser?.userId) return;

    try {
      const response = await fetch('/api/direct-chat/meeting-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          otherUserId: selectedUser.userId,
          platform,
          url,
        }),
      });

      if (response.ok) {
        const linkData = await response.json();
        console.log('✅ Meeting link created successfully:', linkData);

        // Immediately fetch updated meeting links
        await fetchMeetingLinks();
        setShowMeetingOptions(false);
        setMeetingLinkInput('');

        // Show success feedback
        console.log(`🎉 Google Meet link created and shared with ${selectedUser.fullName}`);
        console.log('🔄 Other user should see this meeting within 2 seconds via polling');
      } else {
        const errorData = await response.json();
        console.error('Failed to create meeting link:', errorData.error);
        alert('Failed to create meeting link: ' + errorData.error);
      }
    } catch (error) {
      console.error('Error creating meeting link:', error);
      alert('Failed to create meeting link. Please try again.');
    }
  };

  const deleteMeetingLink = async (linkId: string) => {
    try {
      const response = await fetch('/api/direct-chat/meeting-links', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkId,
        }),
      });

      if (response.ok) {
        console.log('🗑️ Meeting link deleted successfully');
        await fetchMeetingLinks();
      } else {
        const errorData = await response.json();
        console.error('Failed to delete meeting link:', errorData.error);
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

  const getPlatformName = (platform: string) => {
    return 'Google Meet';
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    // Only scroll if there are messages, a chat is selected, and we should auto-scroll
    if (messagesEndRef.current && messages.length > 0 && selectedChat && shouldAutoScroll) {
      // Add a small delay to prevent aggressive scrolling during chat switches
      const timeoutId = setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
          setShouldAutoScroll(false); // Reset the flag after scrolling
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [messages.length, selectedChat, shouldAutoScroll]); // Use messages.length instead of messages array

  // Real-time activity updates
  useEffect(() => {
    const updateActivity = async () => {
      try {
        await fetch('/api/community/users/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update' })
        });
      } catch (error) {
        console.error('Failed to update activity:', error);
      }
    };

    // Update activity every 2 minutes
    const activityInterval = setInterval(updateActivity, 2 * 60 * 1000);

    // Update activity on page visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial activity update
    updateActivity();

    return () => {
      clearInterval(activityInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Refresh user lists periodically for real-time updates
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      fetchRecentChats();
      fetchFollowingUsers();
      fetchUnknownUsers();
      setLastActiveUpdate(Date.now());
    }, 30 * 1000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, []);

  // Meeting functionality - no call signal polling needed

  // Handle mouse events for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = Math.max(280, Math.min(600, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '[') {
          e.preventDefault();
          setSidebarWidth(prev => Math.max(280, prev - 20));
        } else if (e.key === ']') {
          e.preventDefault();
          setSidebarWidth(prev => Math.min(600, prev + 20));
        } else if (e.key === '\\') {
          e.preventDefault();
          setSidebarWidth(320); // Reset to default
        }
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  // Set selected chat from URL parameter
  useEffect(() => {
    if (chatUserId) {
      setSelectedChat(chatUserId);
    }
  }, [chatUserId]);

  // Fetch initial data
  useEffect(() => {
    fetchCurrentUserInternalId();
    fetchRecentChats();
    fetchFollowingUsers();
    fetchUnknownUsers();
  }, []);

  // Fetch messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
      fetchUserInfo(selectedChat);
      fetchMeetingLinks(); // Fetch meeting links when a chat is selected
    }
  }, [selectedChat]);

  // Periodic polling for meeting links to keep them in sync between users
  useEffect(() => {
    if (!selectedUser?.userId) return;

    console.log('🔄 Starting meeting links polling for user:', selectedUser.fullName);

    const pollMeetingLinks = setInterval(() => {
      console.log('📡 Polling meeting links...');
      fetchMeetingLinks();
    }, 2000); // Poll every 2 seconds for faster real-time sync

    return () => {
      console.log('⏹️ Stopping meeting links polling');
      clearInterval(pollMeetingLinks);
    };
  }, [selectedUser?.userId]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCurrentUserInternalId = async () => {
    try {
      const response = await fetch('/api/community/users?type=current-user');
      if (response.ok) {
        const data = await response.json();
        setCurrentUserInternalId(data.user?.userId || null);
      }
    } catch (error) {
      console.error('Error fetching current user ID:', error);
    }
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

  const fetchUnknownUsers = async () => {
    try {
      // Get all users who have sent messages to current user but are not followed
      const response = await fetch('/api/community/users?type=unknown-message-senders');
      if (response.ok) {
        const data = await response.json();
        setUnknownUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching unknown users:', error);
    }
  };

  const fetchUserInfo = async (userId: string) => {
    try {
      const response = await fetch(`/api/community/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedUser({
          userId: data.profile.userId,
          fullName: data.profile.fullName,
          avatarUrl: data.profile.avatarUrl,
          lastActiveAt: data.profile.lastActiveAt,
          isOnline: isUserOnline(data.profile.lastActiveAt)
        });
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
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

  const searchUsers = useCallback(async () => {
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
  }, [searchQuery]);

  const sendMessage = async () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || !selectedChat || sendingMessage) return;

    setSendingMessage(true);
    try {
      // Upload files first if any
      const uploadedFiles = await uploadFiles();

      // Send message with files
      const messageData: {
        recipientId: string;
        content: string;
        files?: Array<{
          fileUrl: string;
          fileName: string;
          fileType: string;
          fileSize: number;
        }>;
      } = {
        recipientId: selectedChat,
        content: newMessage || '',
      };

      // Add file information if files were uploaded
      if (uploadedFiles.length > 0) {
        messageData.files = uploadedFiles.map(file => ({
          fileUrl: file.url,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        }));
      }

      const response = await fetch('/api/community/direct-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        const data = await response.json();

        // Add all created messages to the UI
        if (data.messages && data.messages.length > 0) {
          const newMessages = data.messages.map((msg: { id: string; content: string; senderId: string; recipientId: string; timestamp: string; files?: FileUpload[] }) => ({
            ...msg,
            senderName: data.sender.fullName,
            senderAvatar: data.sender.avatarUrl,
          }));
          setMessages(prev => [...prev, ...newMessages]);
        } else {
          // Fallback for single message
          const newMsg: DirectMessage = {
            ...data.message,
            senderName: data.sender.fullName,
            senderAvatar: data.sender.avatarUrl,
          };
          setMessages(prev => [...prev, newMsg]);
        }

        setNewMessage('');
        setSelectedFiles([]);
        setShouldAutoScroll(true);

        // Update recent chats
        fetchRecentChats();
        fetchUnknownUsers();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleChatSelect = (userId: string) => {
    setSelectedChat(userId);
    router.push(`/chat?with=${userId}`, { scroll: false });
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const isUserOnline = (lastActiveAt?: string) => {
    if (!lastActiveAt) return false;
    const now = new Date();
    const lastActive = new Date(lastActiveAt);
    const diffInMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60));
    return diffInMinutes < 2; // Consider online if active within 2 minutes (more real-time)
  };

  const getLastActiveText = (lastActiveAt?: string) => {
    if (!lastActiveAt) return 'Last seen unknown';

    const now = new Date();
    const lastActive = new Date(lastActiveAt);
    const diffInMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60));

    if (diffInMinutes < 2) return 'Active now';
    if (diffInMinutes < 5) return 'Just now';
    if (diffInMinutes < 60) return `Active ${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `Active ${Math.floor(diffInMinutes / 60)}h ago`;
    return `Active ${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMessageDate = (timestamp: string) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return messageDate.toLocaleDateString([], { weekday: 'long' });
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: FileUpload[] = [];
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/zip',
      'application/x-zip-compressed'
    ];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        alert(`File "${file.name}" is not supported. Allowed types: Images, PDF, Word documents, Text files, and ZIP archives.`);
        continue;
      }

      // Validate file size
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
        continue;
      }

      const fileUpload: FileUpload = { file };

      // Create preview for images only
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileUpload.preview = e.target?.result as string;
          setSelectedFiles(prev => [...prev]);
        };
        reader.readAsDataURL(file);
      }

      newFiles.push(fileUpload);
    }

    if (newFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...newFiles]);

      // Show success message for PDFs and documents
      const pdfCount = newFiles.filter(f => f.file.type === 'application/pdf').length;
      const docCount = newFiles.filter(f => f.file.type.includes('document') || f.file.type.includes('msword')).length;

      if (pdfCount > 0 || docCount > 0) {
        console.log(`📄 Successfully selected ${pdfCount} PDF(s) and ${docCount} document(s) for upload`);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (): Promise<Array<{
    url: string;
    name: string;
    type: string;
    size: number;
  }>> => {
    if (selectedFiles.length === 0) return [];

    setUploadingFiles(true);
    const uploadedFiles: Array<{
      url: string;
      name: string;
      type: string;
      size: number;
    }> = [];

    try {
      for (const fileUpload of selectedFiles) {
        const formData = new FormData();
        formData.append('file', fileUpload.file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedFiles.push({
            url: data.file.url,
            name: fileUpload.file.name,
            type: fileUpload.file.type,
            size: fileUpload.file.size,
          });
        } else {
          throw new Error(`Failed to upload ${fileUpload.file.name}`);
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files. Please try again.');
      setUploadingFiles(false);
      return [];
    }

    setUploadingFiles(false);
    return uploadedFiles;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4" />;
    }
    if (fileType === 'application/pdf') {
      return (
        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.267 14.68c-.184 0-.308.018-.372.036v1.178c.076.018.171.023.302.023.479 0 .774-.242.774-.651 0-.366-.254-.586-.704-.586zm3.487.012c-.2 0-.33.018-.407.036v2.61c.077.018.201.018.313.018.817.006 1.349-.444 1.349-1.396.006-.83-.479-1.268-1.255-1.268z" />
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
          <path d="M14 2v6h6" />
          <path d="M8.597 11.085h.906v2.189h-.906v-2.189zm4.045 0h.906v2.189h-.906v-2.189z" />
        </svg>
      );
    }
    if (fileType === 'application/msword' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return (
        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
          <path d="M14 2v6h6" />
          <path d="M10.5 12.5L9.5 16l-1-3.5L7.5 16l-1-3.5h1.25l.5 2 .5-2h.5l.5 2 .5-2h1.25z" />
        </svg>
      );
    }
    if (fileType === 'text/plain') {
      return (
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
    if (fileType === 'application/zip' || fileType === 'application/x-zip-compressed') {
      return (
        <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
          <path d="M14 2v6h6" />
          <path d="M10 11h1v1h-1v-1zm1 1h1v1h-1v-1zm-1 1h1v1h-1v-1zm1 1h1v1h-1v-1z" />
        </svg>
      );
    }
    return <FileText className="w-4 h-4" />;
  };

  // Function to handle profile navigation
  const handleProfileClick = (userId?: string, userName?: string) => {
    if (userId && userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      router.push(`/profile/${userId}`);
    } else {
      // Show error or search for user by name
      console.log('Invalid user ID or missing userId for:', userName);
      // Could implement a user search page here in the future
    }
  };

  // Meeting functionality replaces old call functions - no call handlers needed

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gray-300 dark:bg-slate-700 rounded-full mx-auto mb-4"></div>
          <div className="h-4 w-32 bg-gray-300 dark:bg-slate-700 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  // Meeting functionality - no call component rendering needed

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-gray-200/30 dark:border-slate-700/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push('/home')}
              className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-purple-300 transition-all"
            >
              Manetho
            </button>
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Messages
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200"
            >
              {theme === "dark" ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 h-screen flex">
        {/* Sidebar - Chat List */}
        <div
          className="bg-white/95 dark:bg-slate-900/95 border-r border-gray-200/30 dark:border-slate-700/30 flex flex-col h-full relative"
          style={{ width: `${sidebarWidth}px`, minWidth: '280px', maxWidth: '600px' }}
        >
          {/* Search */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200/30 dark:border-slate-700/30">
            {/* Real-time Status Header */}
            <div className="flex items-center justify-between mb-3 text-xs text-gray-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live updates</span>
              </div>
              <span>
                {new Date(lastActiveUpdate).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-slate-800/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400"
              />
            </div>
          </div>

          {/* Chat List - Scrollable */}
          <div className="flex-1 overflow-y-auto scrollbar-enhanced">
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="p-3">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Search Results</h3>
                {searchResults.map((user) => (
                  <div
                    key={user.userId}
                    onClick={() => handleChatSelect(user.userId)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${selectedChat === user.userId ? 'bg-blue-500/10 dark:bg-blue-500/20' : ''
                      }`}
                  >
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProfileClick(user.userId, user.fullName);
                        }}
                        className="hover:scale-110 transition-transform duration-300"
                      >
                        <img
                          src={user.avatarUrl}
                          alt={user.fullName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {isUserOnline(user.lastActiveAt) && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></div>
                        )}
                      </button>
                    </div>
                    <div className="flex-1 text-left">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProfileClick(user.userId, user.fullName);
                        }}
                        className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                      >
                        {user.fullName}
                      </button>
                      <p className="text-sm text-gray-500 dark:text-slate-400">{getLastActiveText(user.lastActiveAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recent Chats */}
            {!searchQuery && recentChats.length > 0 && (
              <div className="p-3">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Recent</h3>
                {recentChats.map((user) => (
                  <div
                    key={user.userId}
                    onClick={() => handleChatSelect(user.userId)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${selectedChat === user.userId ? 'bg-blue-500/10 dark:bg-blue-500/20' : ''
                      }`}
                  >
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProfileClick(user.userId, user.fullName);
                        }}
                        className="hover:scale-110 transition-transform duration-300"
                      >
                        <img
                          src={user.avatarUrl}
                          alt={user.fullName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {isUserOnline(user.lastActiveAt) && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></div>
                        )}
                      </button>
                    </div>
                    <div className="flex-1 text-left">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProfileClick(user.userId, user.fullName);
                        }}
                        className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                      >
                        {user.fullName}
                      </button>
                      <p className="text-sm text-gray-500 dark:text-slate-400">{getLastActiveText(user.lastActiveAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Following Users */}
            {!searchQuery && followingUsers.length > 0 && (
              <div className="p-3">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Learning Partners</h3>
                {followingUsers.map((user) => (
                  <div
                    key={user.userId}
                    onClick={() => handleChatSelect(user.userId)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${selectedChat === user.userId ? 'bg-blue-500/10 dark:bg-blue-500/20' : ''
                      }`}
                  >
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProfileClick(user.userId, user.fullName);
                        }}
                        className="hover:scale-110 transition-transform duration-300"
                      >
                        <img
                          src={user.avatarUrl}
                          alt={user.fullName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {isUserOnline(user.lastActiveAt) && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></div>
                        )}
                      </button>
                    </div>
                    <div className="flex-1 text-left">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProfileClick(user.userId, user.fullName);
                        }}
                        className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                      >
                        {user.fullName}
                      </button>
                      <p className="text-sm text-gray-500 dark:text-slate-400">{getLastActiveText(user.lastActiveAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Unknown Users */}
            {!searchQuery && unknownUsers.length > 0 && (
              <div className="p-3">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Unknown person message</h3>
                {unknownUsers.map((user) => (
                  <div
                    key={user.userId}
                    onClick={() => handleChatSelect(user.userId)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${selectedChat === user.userId ? 'bg-blue-500/10 dark:bg-blue-500/20' : ''
                      }`}
                  >
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProfileClick(user.userId, user.fullName);
                        }}
                        className="hover:scale-110 transition-transform duration-300"
                      >
                        <img
                          src={user.avatarUrl}
                          alt={user.fullName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {isUserOnline(user.lastActiveAt) && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></div>
                        )}
                      </button>
                    </div>
                    <div className="flex-1 text-left">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProfileClick(user.userId, user.fullName);
                        }}
                        className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                      >
                        {user.fullName}
                      </button>
                      <p className="text-sm text-gray-500 dark:text-slate-400">{getLastActiveText(user.lastActiveAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!searchQuery && recentChats.length === 0 && followingUsers.length === 0 && unknownUsers.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <MessageCircle className="w-16 h-16 text-gray-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No conversations yet</h3>
                <p className="text-gray-500 dark:text-slate-400">Start following users to begin messaging!</p>
              </div>
            )}
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className={`w-1 bg-transparent hover:bg-blue-500/20 cursor-ew-resize transition-colors duration-200 relative group ${isResizing ? 'bg-blue-500/40' : ''
            }`}
          onMouseDown={handleResizeStart}
          title="Drag to resize sidebar (Ctrl+[ / Ctrl+] / Ctrl+\)"
        >
          <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
            <div className="w-0.5 h-8 bg-gray-300 dark:bg-slate-600 group-hover:bg-blue-500 transition-colors duration-200"></div>
          </div>

          {/* Resize instructions tooltip */}
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            <div>Drag to resize</div>
            <div className="text-gray-300">Ctrl+[ / Ctrl+] / Ctrl+\</div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">{/* min-w-0 to prevent flex overflow */}
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white/95 dark:bg-slate-900/95 border-b border-gray-200/30 dark:border-slate-700/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <button
                      onClick={() => handleProfileClick(selectedUser.userId, selectedUser.fullName)}
                      className="hover:scale-110 transition-transform duration-300"
                    >
                      <img
                        src={selectedUser.avatarUrl}
                        alt={selectedUser.fullName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {selectedUser.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></div>
                      )}
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={() => handleProfileClick(selectedUser.userId, selectedUser.fullName)}
                      className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left block"
                    >
                      {selectedUser.fullName}
                    </button>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{getLastActiveText(selectedUser.lastActiveAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Meeting Links Section */}
                  <div className="relative">
                    {meetingLinks.length > 0 && (
                      <div className="flex items-center gap-1 mr-2">
                        {meetingLinks.slice(0, 1).map((link) => (
                          <div key={link.linkId} className="flex items-center gap-1">
                            <Button
                              onClick={() => window.open(link.url, '_blank')}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 h-7 text-xs"
                              size="sm"
                              title={`Join ${getPlatformName(link.platform)}`}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">Join {getPlatformName(link.platform)}</span>
                              <span className="sm:hidden">Join</span>
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => copyMeetingLink(link.url, link.linkId)}
                              size="sm"
                              title="Copy link"
                              className="px-1 py-1 h-7"
                            >
                              {copiedLinkId === link.linkId ? (
                                <CheckCircle className="w-3 h-3 text-green-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        const isOpening = !showMeetingOptions;
                        setShowMeetingOptions(isOpening);
                        // Refresh meeting links when opening the dropdown
                        if (isOpening) {
                          console.log('🔄 Refreshing meeting links (dropdown opened)');
                          fetchMeetingLinks();
                        }
                      }}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium ${meetingLinks.length === 0
                        ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                        : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50'
                        }`}
                      title={meetingLinks.length === 0 ? "Start a new meeting" : "Manage meetings"}
                    >
                      {meetingLinks.length === 0 ? (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Start Meeting</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span>Meeting</span>
                          <div className="w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                            {meetingLinks.length}
                          </div>
                          <svg className={`w-4 h-4 ml-1 transition-transform duration-200 ${showMeetingOptions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      )}
                    </button>

                    {/* Meeting Options Dropdown */}
                    {showMeetingOptions && (
                      <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg z-50">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {meetingLinks.length === 0 ? 'Start Meeting' : 'Active Meetings'}
                              </h4>
                              {meetingLinks.length > 0 && (
                                <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                                  {meetingLinks.length} Live
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  console.log('🔄 Manual refresh of meeting links');
                                  fetchMeetingLinks();
                                }}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-gray-500 dark:text-gray-400 transition-colors"
                                title="Refresh meetings"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setShowMeetingOptions(false)}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Existing Meeting Links */}
                          <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                            {meetingLinks.map((link) => (
                              <div key={link.linkId} className="flex items-center justify-between bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                      {getPlatformName(link.platform)} Meeting
                                    </span>
                                    <div className="px-1.5 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded font-medium">
                                      LIVE
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    Started by {link.creatorName}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    onClick={() => window.open(link.url, '_blank')}
                                    className="h-8 px-3 bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md transition-all duration-200 font-medium text-xs"
                                    title="Join meeting"
                                  >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Join
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    onClick={() => copyMeetingLink(link.url, link.linkId)}
                                    className="h-8 px-2 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                    title="Copy link"
                                  >
                                    {copiedLinkId === link.linkId ? (
                                      <CheckCircle className="w-3 h-3 text-green-500" />
                                    ) : (
                                      <Copy className="w-3 h-3 text-gray-500" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    onClick={() => deleteMeetingLink(link.linkId)}
                                    className="h-8 px-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    title="End meeting"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}

                            {meetingLinks.length === 0 && (
                              <div className="text-center py-6">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <Video className="w-6 h-6 text-blue-500" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">No active meetings</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Start a meeting to connect instantly</p>
                              </div>
                            )}
                          </div>

                          {/* Start Google Meet Section */}
                          <div className={`${meetingLinks.length > 0 ? 'border-t pt-4' : ''}`}>
                            <Button
                              onClick={() => generateMeetingLink('google')}
                              className="w-full justify-center bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-sm hover:shadow-md transition-all duration-200 h-12 text-base font-medium mb-4"
                            >
                              <Plus className="w-5 h-5 mr-2" />
                              {meetingLinks.length > 0 ? 'Start New Google Meet' : 'Start Google Meet'}
                            </Button>

                            {/* Custom Link Input */}
                            <div className="space-y-2">
                              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <span>Or paste existing Google Meet link</span>
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="url"
                                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                  value={meetingLinkInput}
                                  onChange={(e) => setMeetingLinkInput(e.target.value)}
                                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                                <Button
                                  onClick={() => {
                                    if (meetingLinkInput.trim()) {
                                      createMeetingLink('google', meetingLinkInput.trim());
                                    }
                                  }}
                                  disabled={!meetingLinkInput.trim()}
                                  className={`h-10 px-4 transition-all duration-200 ${meetingLinkInput.trim()
                                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                                    }`}
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 bg-white/30 dark:bg-slate-950/30 scrollbar-enhanced">
                {messages.map((message, index) => {
                  const isOwn = message.senderId === currentUserInternalId;
                  const showDate = index === 0 || formatMessageDate(messages[index - 1]?.timestamp) !== formatMessageDate(message.timestamp);

                  return (
                    <div key={message.messageId}>
                      {/* Date separator */}
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <div className="bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-300 text-xs px-3 py-1 rounded-full">
                            {formatMessageDate(message.timestamp)}
                          </div>
                        </div>
                      )}

                      {/* Message */}
                      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
                        <div className={`max-w-[70%] ${isOwn ? 'flex flex-col items-end' : 'flex items-start gap-3'}`}>
                          {!isOwn && (
                            <button
                              onClick={() => handleProfileClick(message.senderId, message.senderName)}
                              className="hover:scale-110 transition-transform duration-300"
                            >
                              <img
                                src={message.senderAvatar}
                                alt={message.senderName}
                                className="w-8 h-8 rounded-full object-cover mt-1 flex-shrink-0"
                              />
                            </button>
                          )}
                          <div className="flex flex-col">
                            {!isOwn && (
                              <button
                                onClick={() => handleProfileClick(message.senderId, message.senderName)}
                                className="text-xs text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-1 ml-1 text-left"
                              >
                                {message.senderName}
                              </button>
                            )}
                            <div className={`p-3 rounded-2xl ${isOwn
                              ? 'bg-blue-500 text-white rounded-br-md'
                              : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-bl-md shadow-sm border border-gray-100 dark:border-slate-700'
                              }`}>
                              {/* File Attachment */}
                              {message.fileUrl && (
                                <div className="mb-2">
                                  {message.fileType?.startsWith('image/') ? (
                                    <div className="relative">
                                      <img
                                        src={message.fileUrl}
                                        alt={message.fileName}
                                        className="max-w-sm max-h-80 rounded-lg object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                        onClick={() => window.open(message.fileUrl, '_blank')}
                                      />
                                    </div>
                                  ) : message.fileType === 'application/pdf' ? (
                                    <div className={`p-3 rounded-lg border-2 border-dashed ${isOwn
                                      ? 'bg-blue-400/20 border-blue-200'
                                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                                      }`}>
                                      <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0">
                                          {getFileIcon(message.fileType)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className={`text-sm font-medium truncate ${isOwn ? 'text-white' : 'text-gray-900 dark:text-white'
                                            }`}>
                                            📄 {message.fileName}
                                          </p>
                                          <p className={`text-xs ${isOwn ? 'text-blue-100' : 'text-red-600 dark:text-red-400'
                                            }`}>
                                            PDF Document • {message.fileSize && formatFileSize(message.fileSize)}
                                          </p>
                                        </div>
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => window.open(message.fileUrl, '_blank')}
                                            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${isOwn
                                              ? 'bg-white/20 text-white hover:bg-white/30'
                                              : 'bg-red-500 text-white hover:bg-red-600'
                                              }`}
                                            title="Open in new tab"
                                          >
                                            Preview
                                          </button>
                                          <button
                                            onClick={() => downloadFile(message.fileUrl!, message.fileName || 'document.pdf')}
                                            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${isOwn
                                              ? 'bg-white/20 text-white hover:bg-white/30'
                                              : 'bg-gray-500 text-white hover:bg-gray-600'
                                              }`}
                                            title="Download file"
                                          >
                                            Download
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className={`flex items-center gap-3 p-3 rounded-lg border ${isOwn
                                      ? 'bg-blue-400/20 border-blue-200'
                                      : 'bg-gray-100 dark:bg-slate-700 border-gray-200 dark:border-slate-600'
                                      }`}>
                                      <div className="flex-shrink-0">
                                        {getFileIcon(message.fileType || '')}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate ${isOwn ? 'text-white' : 'text-gray-900 dark:text-white'
                                          }`}>
                                          {message.fileName}
                                        </p>
                                        {message.fileSize && (
                                          <p className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-slate-400'
                                            }`}>
                                            {formatFileSize(message.fileSize)}
                                          </p>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => downloadFile(message.fileUrl!, message.fileName || 'document.pdf')}
                                        className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${isOwn
                                          ? 'bg-white/20 text-white hover:bg-white/30'
                                          : 'bg-gray-500 text-white hover:bg-gray-600'
                                          }`}
                                        title="Download file"
                                      >
                                        Download
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Message Text */}
                              {message.content && (
                                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                              )}

                              <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-slate-400'}`}>
                                  {formatTime(message.timestamp)}
                                </span>
                                {isOwn && (
                                  <div className="ml-1">
                                    {message.isRead ? (
                                      <CheckCheck className="w-3 h-3 text-blue-100" />
                                    ) : (
                                      <Check className="w-3 h-3 text-blue-200" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white/95 dark:bg-slate-900/95 border-t border-gray-200/30 dark:border-slate-700/30">
                {/* File Previews */}
                {selectedFiles.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {selectedFiles.map((fileUpload, index) => (
                      <div key={index} className="relative bg-gray-100 dark:bg-slate-800 rounded-lg p-3 flex items-center gap-3 max-w-xs">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {fileUpload.preview ? (
                            <img src={fileUpload.preview} alt="" className="w-10 h-10 rounded object-cover" />
                          ) : (
                            <div className={`w-10 h-10 rounded flex items-center justify-center ${fileUpload.file.type === 'application/pdf'
                              ? 'bg-red-100 dark:bg-red-900/30'
                              : 'bg-gray-200 dark:bg-slate-700'
                              }`}>
                              {getFileIcon(fileUpload.file.type)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                              {fileUpload.file.type === 'application/pdf' ? '📄 ' : ''}{fileUpload.file.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">
                              {fileUpload.file.type === 'application/pdf' && 'PDF • '}{formatFileSize(fileUpload.file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  {/* File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt,.zip"
                  />

                  {/* File Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFiles || sendingMessage}
                    className="p-3 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Message ${selectedUser.fullName}...`}
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 resize-none max-h-32"
                      rows={1}
                      style={{ height: 'auto', minHeight: '2.75rem' }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = target.scrollHeight + 'px';
                      }}
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={(!newMessage.trim() && selectedFiles.length === 0) || sendingMessage || uploadingFiles}
                    className="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center min-w-[3rem]"
                  >
                    {(sendingMessage || uploadingFiles) ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* No Chat Selected */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-24 h-24 text-gray-300 dark:text-slate-600 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Select a conversation</h2>
                <p className="text-gray-500 dark:text-slate-400 max-w-sm">
                  Choose from your recent chats or start a new conversation with your learning partners.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Meeting functionality - no incoming call notification needed */}
    </div>
  );
} 
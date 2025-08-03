"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Image, Loader2, Plus, User, Trash2, Copy, Check, ArrowLeft, Stars, InfoIcon, FileText, RefreshCw, X } from "lucide-react";
import ThemeToggle from '../../../../components/theme/ThemeToggle';
// Removed unused imports
import 'katex/dist/katex.min.css';
import katex from 'katex';

// Interface for chat messages
interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
  id?: string;
  attachment?: {
    type: string;
    name: string;
    url: string;
    size: number;
  };
}

// Define a chat session type
interface ChatSession {
  id: string;
  title: string;
  lastMessageDate: Date;
  messages: ChatMessage[];
}

export default function DoubtSolvingPage() {
  // Current input state
  const [query, setQuery] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    downloadUrl: string;
    previewUrl?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chat management
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatMessage[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // UI state
  const [isCopied, setIsCopied] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Resizable sidebar state
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);

  // File preview state
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);

  // Function to scroll to the bottom of the chat
  const scrollToBottom = useCallback((instant: boolean = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: instant ? 'auto' : 'smooth',
        block: 'end'
      });
    }

    // Also use direct scrolling on the container as a fallback
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: instant ? 'auto' : 'smooth'
      });
    }
  }, []);

  // Check if user has scrolled up and show scroll button if needed
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isScrolledUp);

      // Also check and render any unprocessed LaTeX
      ensureLatexRendered();
    }
  };

  // Load sessions from database
  const loadSessions = useCallback(async (preserveActiveSession = true) => {
    try {
      setIsLoadingSessions(true);
      const response = await fetch('/api/doubt-solving/sessions');

      if (response.ok) {
        const data = await response.json();
        const dbSessions = data.sessions.map((session: {
          id: string;
          title: string;
          lastMessageDate: string;
        }) => ({
          id: session.id,
          title: session.title,
          lastMessageDate: new Date(session.lastMessageDate),
          messages: [], // Will be loaded when session is selected
        }));

        // Update sessions while preserving current messages if we have an active session
        setChatSessions(prevSessions => {
          if (preserveActiveSession && activeSessionId) {
            const currentSession = prevSessions.find((s: ChatSession) => s.id === activeSessionId);
            if (currentSession) {
              // Preserve the current session's messages and update its title from DB
              const updatedSession = dbSessions.find((s: ChatSession) => s.id === activeSessionId);
              if (updatedSession) {
                return dbSessions.map((s: ChatSession) =>
                  s.id === activeSessionId
                    ? { ...s, messages: currentSession.messages }
                    : s
                );
              }
            }
          }
          return dbSessions;
        });

        // If no active session and we have sessions, activate the first one
        if (!activeSessionId && dbSessions.length > 0) {
          setActiveSessionId(dbSessions[0].id);
          await loadMessages(dbSessions[0].id);
        }

        // If we have an active session, make sure it's still in the list
        if (activeSessionId && dbSessions.length > 0) {
          const currentSession = dbSessions.find((s: ChatSession) => s.id === activeSessionId);
          if (!currentSession) {
            // Active session no longer exists, switch to first available
            setActiveSessionId(dbSessions[0].id);
            await loadMessages(dbSessions[0].id);
          }
        }
      } else {
        console.warn('Failed to load sessions from database, using local storage');
        // Fallback to existing localStorage logic if needed
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  }, [activeSessionId]);

  // Load messages for a specific session
  const loadMessages = useCallback(async (sessionId: string) => {
    try {
      setIsLoadingMessages(true);
      const response = await fetch(`/api/doubt-solving/sessions/${sessionId}/messages`);

      if (response.ok) {
        const data = await response.json();
        const dbMessages = data.messages.map((msg: {
          id: string;
          role: string;
          content: string;
          timestamp: string;
          attachmentUrl?: string;
          attachmentType?: string;
          attachmentName?: string;
          attachmentSize?: number;
        }) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          attachment: msg.attachmentUrl ? {
            type: msg.attachmentType,
            name: msg.attachmentName,
            url: msg.attachmentUrl,
            size: msg.attachmentSize
          } : undefined
        }));
        setCurrentChat(dbMessages);

        // Update the session in our local state
        setChatSessions(prev => prev.map(session =>
          session.id === sessionId
            ? { ...session, messages: dbMessages }
            : session
        ));
      } else {
        console.warn('Failed to load messages from database');
        setCurrentChat([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setCurrentChat([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Create session in database
  const createSessionInDB = async (title: string) => {
    try {
      const response = await fetch('/api/doubt-solving/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.session;
      } else {
        console.warn('Failed to create session in database');
        return null;
      }
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  };

  // Delete session from database
  const deleteSessionFromDB = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/doubt-solving/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      // Consider both 200 (deleted) and 404 (already deleted) as success
      if (response.ok || response.status === 404) {
        return true;
      }

      // Log error for other status codes
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Failed to delete session:', errorData);
      return false;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  };

  // Add custom CSS animations
  useEffect(() => {
    // Add CSS for animations and tailored ChatGPT-style elements
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from { transform: translateY(10px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      .animate-fadeIn {
        animation: fadeIn 0.3s ease-in-out;
      }
      
      .animate-slideUp {
        animation: slideUp 0.3s ease-in-out;
      }
            
      /* Custom styling for code blocks */
      .markdown-content pre {
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        margin: 16px 0;
        padding: 12px;
        overflow-x: auto;
      }
      
      /* User bubble styling */
      .user-bubble {
        background-color:rgb(210, 217, 228);
        color: #1f2937;
        border-radius: 12px;
        padding: 10px 14px;
        max-width: 80%;
        margin-left: auto;
        margin-right: 16px;
        word-wrap: break-word;
        overflow-wrap: break-word;
        hyphens: auto;
      }
      
      .dark .user-bubble {
        background-color: #19c37d;
        color: white;
      }
      
      /* AI bubble styling */
      .ai-bubble {
        background-color: transparent;
        color: #6b7280;
        border-radius: 0;
        padding: 0;
        max-width: 85%;
        margin-left: 16px;
        word-wrap: break-word;
        overflow-wrap: break-word;
        hyphens: auto;
      }
      
      .dark .ai-bubble {
        color: #d1d5db;
      }
      
      /* Message content styling */
      .message-content {
        color: #1f2937;
      }
      
      .dark .message-content {
        color: #f9fafb;
      }
      
      /* ChatGPT-specific message styling */
      .message-content p {
        margin-top: 0;
        margin-bottom: 1em;
      }
      
      .message-content p:last-child {
        margin-bottom: 0;
      }
      
      .message-content ul, .message-content ol {
        margin-top: 0;
        margin-bottom: 1em;
        padding-left: 1.5em;
      }

      .message-content ul li {
        list-style-type: disc;
        margin-bottom: 0.25em;
      }

      .message-content ol li {
        list-style-type: decimal;
        margin-bottom: 0.25em;
      }
      
      .message-content h1, .message-content h2, .message-content h3 {
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        font-weight: 600;
      }
      
      .message-container:hover .message-actions {
        opacity: 1;
      }
      
      .katex-display {
        overflow-x: auto;
        overflow-y: hidden;
        padding: 0.5em 0;
      }
      
      /* Improved message action buttons styles */
      .copy-button {
        opacity: 1;
        transition: all 0.2s ease;
      }
      
      .copy-button button:hover {
        background-color: rgba(55, 65, 81, 0.9) !important;
        transform: scale(1.02);
        border-color: rgba(156, 163, 175, 0.8) !important;
      }

      /* Improved send button styles */
      .send-button {
        background-color: #d1d5db;
        color: #374151;
        border-radius: 6px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }
      
      .send-button:hover {
        background-color: #9ca3af;
      }
      
      .dark .send-button {
        background-color: #19c37d;
        color: white;
      }
      
      .dark .send-button:hover {
        background-color: #2ea675;
      }

      /* Scrollbar styling to match ChatGPT */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      
      ::-webkit-scrollbar-thumb {
        background: #565869;
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: #7b7c8a;
      }

      /* Sidebar toggle button */
      .sidebar-toggle {
        position: fixed;
        top: 12px;
        right: 12px;
        z-index: 40;
        background-color: rgba(32, 33, 35, 0.6);
        border-radius: 6px;
        padding: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .sidebar-toggle:hover {
        background-color: rgba(32, 33, 35, 0.8);
      }

      /* Chat message alignment */
      .chat-row {
        display: flex;
        align-items: flex-start;
        padding: 1.5rem;
        width: 100%;
        overflow-x: hidden;
      }
      
      .chat-row.user {
        background-color: transparent;
      }
      
      .chat-row.assistant {
        background-color: transparent;
      }
      
      .chat-row .flex {
        width: 100%;
        max-width: 90%;
        margin: 0 auto;
        overflow-x: hidden;
      }
      
      .chat-avatar {
        width: 30px;
        height: 30px;
        border-radius: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      
      .chat-avatar.user {
        background-color: #19c37d;
        margin-left: 13px;
      }
      
      .chat-avatar.assistant {
        background-color: #2971bd;
        margin-right: 16px;
      }
      
      /* Sidebar transition */
      .sidebar-container {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        z-index: 50;
        background-color: #1f2937;
        height: 100%;
      }
      
      .main-content {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        background-color: transparent;
        height: 100%;
        width: 100%;
        z-index: 10;
        margin: 0;
        padding: 0;
        border: none;
        outline: none;
        overflow: hidden;
        box-shadow: none;
      }
      
      /* Resize handle */
      .resize-handle {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 8px;
        background: linear-gradient(to left, transparent, rgba(59, 130, 246, 0.3), transparent);
        cursor: col-resize;
        z-index: 60;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .resize-handle::before {
        content: '';
        width: 2px;
        height: 40px;
        background: rgba(59, 130, 246, 0.6);
        border-radius: 1px;
        transition: all 0.2s ease;
      }
      
      .resize-handle:hover {
        background: linear-gradient(to left, transparent, rgba(59, 130, 246, 0.6), transparent);
        width: 12px;
      }
      
      .resize-handle:hover::before {
        background: rgba(59, 130, 246, 1);
        height: 60px;
      }
      
      .resize-handle.resizing {
        background: linear-gradient(to left, transparent, rgba(59, 130, 246, 0.8), transparent);
        width: 12px;
      }
      
      .resize-handle.resizing::before {
        background: rgba(59, 130, 246, 1);
        height: 80px;
      }
      
      /* Animated thinking indicator */
      .thinking-dots {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      
      .thinking-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: linear-gradient(45deg, #06b6d4, #3b82f6);
        animation: thinking-pulse 1.4s ease-in-out infinite both;
      }
      
      .thinking-dot:nth-child(1) { animation-delay: -0.32s; }
      .thinking-dot:nth-child(2) { animation-delay: -0.16s; }
      .thinking-dot:nth-child(3) { animation-delay: 0s; }
      
      @keyframes thinking-pulse {
        0%, 80%, 100% {
          transform: scale(0.8);
          opacity: 0.5;
        }
        40% {
          transform: scale(1.2);
          opacity: 1;
        }
      }
      
      .thinking-text {
        background: linear-gradient(45deg, #06b6d4, #3b82f6, #8b5cf6);
        background-size: 200% 200%;
        animation: thinking-gradient 2s ease-in-out infinite;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: 600;
      }
      
      @keyframes thinking-gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      /* File preview styles */
      .file-thumbnail {
        transition: all 0.2s ease;
      }
      
      .file-thumbnail:hover {
        transform: scale(1.02);
      }
      
      /* Sidebar toggle */
      .hamburger-button {
        cursor: pointer;
        padding: 8px;
        border-radius: 4px;
        transition: background-color 0.2s ease;
      }
      
      .hamburger-button:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
      

      
      /* Ensure sidebar content doesn't overflow */
      .sidebar-container > div {
        overflow-y: auto;
        overflow-x: hidden;
      }
      
      /* Prevent text overflow in sidebar */
      .sidebar-container .truncate {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      /* Message bubble widths */
      .message-bubble {
        max-width: 80%;
      }
      
      /* Input area styling */
      .input-area {
        position: fixed;
        bottom: 12px;
        left: ${sidebarWidth}px;
        right: 0;
        z-index: 100;
        background: transparent;
        padding: 0;
        margin: 0;
        border: none;
        outline: none;
        box-shadow: none;
        display: flex;
        justify-content: center;
      }
      
      .input-container {
        width: 700px;
        max-width: calc(100% - 60px);
        margin: 0;
        background: transparent;
        border: none;
        outline: none;
        box-shadow: none;
        padding: 0;
        position: relative;
      }
      
      .attachment-preview {
        background: transparent;
        border: none;
        outline: none;
        box-shadow: none;
        margin-bottom: 8px;
      }
      
      /* Cursor pointer for all clickable elements */
      button, 
      [onClick], 
      .cursor-pointer,
      .hover\\:bg-gray-700,
      .hover\\:bg-red-500\\/20,
      .hover\\:bg-gray-800,
      .hover\\:from-emerald-700,
      .hover\\:to-teal-700,
      .hover\\:from-gray-700,
      .hover\\:to-gray-600,
      .hover\\:from-purple-600,
      .hover\\:to-indigo-600 {
        cursor: pointer;
      }
      
      .input-textarea {
        background-color: rgba(243, 244, 246, 0.9);
        backdrop-filter: blur(8px);
        border-radius: 16px;
        color: #1f2937;
        resize: none;
        height: 80px;
        max-height: 80px;
        min-height: 80px;
        border: 1px solid rgba(156, 163, 175, 0.3);
        outline: none;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        padding: 18px 20px;
        font-size: 16px;
        line-height: 1.5;
        width: 100%;
        overflow-y: auto;
        overflow-x: hidden;
      }
      
      .dark .input-textarea {
        background-color: rgba(64, 65, 79, 0.8);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      }
      
      /* Message list styling */
      .message-list {
        position: absolute;
        top: 0px; /* Start immediately below header */
        bottom: 100px; /* Account for floating input */
        left: 0;
        right: 0;
        overflow-y: auto;
        overflow-x: hidden;
        scroll-behavior: smooth;
        padding-bottom: 30px; /* Add padding to ensure last message is fully visible */
        background: transparent;
        border: none;
        outline: none;
        box-shadow: none;
      }
      

      
      /* Message content wrap */
      .message-content-wrap {
        max-width: 90%;
        width: 100%;
        padding: 0 1rem;
        overflow-x: hidden;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }
      
      /* Empty screen styling */
      .empty-screen {
        background-color: transparent;
        position: absolute;
        top: 0px;
        bottom: 100px;
        left: 0;
        right: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: none;
        outline: none;
        box-shadow: none;
      }
      
      .empty-screen .grid {
        width: 90%;
        max-width: 1200px;
      }
      
      /* Message container */
      .message-container {
        width: 100%;
        display: flex;
        justify-content: center;
        overflow-x: hidden;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (currentChat.length > 0) {
      // Use setTimeout to ensure DOM has updated before scrolling
      setTimeout(() => scrollToBottom(true), 100);
    }
  }, [currentChat.length]);

  // Scroll to bottom on initial render and after page refresh
  useEffect(() => {
    if (currentChat.length > 0) {
      // Force scroll to bottom on mount
      setTimeout(() => scrollToBottom(true), 300);
    }
  }, []);

  // Check if mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setShowSidebar(false);
      }
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    // Force scroll to bottom on page load
    setTimeout(() => scrollToBottom(true), 500);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Auto adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      const minHeight = attachmentPreview ? 80 : 56; // Taller minimum when there's an attachment
      textareaRef.current.style.height = `${minHeight}px`; // Reset height to minimum
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 300)}px`; // Increased max height
    }
  }, [query, attachmentPreview]);

  // Load sessions from database on mount (prioritize database over localStorage)
  useEffect(() => {
    // Clear localStorage to ensure we start fresh with database data
    localStorage.removeItem('chatSessions');
    loadSessions(false); // Load from database first
  }, [loadSessions]);

  // Note: We now rely on database storage instead of localStorage

  // Add styles to head for markdown content
  useEffect(() => {
    // Add CSS for markdown styling
    const style = document.createElement('style');
    style.innerHTML = `
      .markdown-content strong {
        font-weight: 600;
      }
      .markdown-content em {
        font-style: italic;
      }
      .markdown-content code.inline-code {
        background-color: rgba(0, 0, 0, 0.1);
        padding: 2px 4px;
        border-radius: 3px;
        font-family: monospace;
      }
      .markdown-content pre {
        background-color: rgba(0, 0, 0, 0.1);
        padding: 12px;
        border-radius: 6px;
        overflow-x: auto;
      }
      .markdown-content pre code {
        font-family: monospace;
        white-space: pre;
      }
      .markdown-content ul, .markdown-content ol {
        padding-left: 1.5rem;
        margin: 0.5rem 0;
      }
      .markdown-content li {
        margin: 0.25rem 0;
      }
      .markdown-content a {
        color: #3b82f6;
        text-decoration: underline;
      }
      .dark .markdown-content a {
        color: #60a5fa;
      }
      .markdown-content h1, .markdown-content h2, .markdown-content h3 {
        font-weight: 600;
        margin: 1rem 0 0.5rem;
      }
      .markdown-content h1 {
        font-size: 1.5rem;
      }
      .markdown-content h2 {
        font-size: 1.25rem;
      }
      .markdown-content h3 {
        font-size: 1.125rem;
      }
      .markdown-content p {
        margin: 0.5rem 0;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const createNewSession = async (): Promise<string | null> => {
    const title = "New Chat";

    // Create session in database
    const dbSession = await createSessionInDB(title);

    if (dbSession) {


      const newSession: ChatSession = {
        id: dbSession.id,
        title: dbSession.title,
        lastMessageDate: new Date(dbSession.lastMessageDate),
        messages: []
      };

      setChatSessions([...chatSessions, newSession]);
      setActiveSessionId(dbSession.id);
      setCurrentChat([]);

      if (isMobile) {
        setShowSidebar(false);
      }

      return dbSession.id;
    } else {
      // Fallback to local session if database fails
      const newId = Date.now().toString();
      const newSession: ChatSession = {
        id: newId,
        title: "New Chat",
        lastMessageDate: new Date(),
        messages: []
      };

      setChatSessions([...chatSessions, newSession]);
      setActiveSessionId(newId);
      setCurrentChat([]);

      if (isMobile) {
        setShowSidebar(false);
      }

      return newId;
    }
  };

  const switchSession = async (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setActiveSessionId(sessionId);

      // Load messages from database if not already loaded
      if (session.messages.length === 0) {
        await loadMessages(sessionId);
      } else {
        setCurrentChat(session.messages);
      }

      if (isMobile) {
        setShowSidebar(false);
      }
    }
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Immediately remove from local state for better UX
    const updatedSessions = chatSessions.filter(s => s.id !== sessionId);
    setChatSessions(updatedSessions);

    // If the active session was deleted, activate another one or create new
    if (sessionId === activeSessionId) {
      if (updatedSessions.length > 0) {
        setActiveSessionId(updatedSessions[0].id);
        await loadMessages(updatedSessions[0].id);
      } else {
        await createNewSession();
      }
    }

    // Try to delete from database in the background
    try {
      await deleteSessionFromDB(sessionId);
    } catch (error) {
      console.error('Error deleting session from database (but removed from UI):', error);
      // Don't revert the UI change - the session is already removed from the interface
    }
  };



  // Update session with new messages
  const updateSessionMessages = (sessionId: string, messages: ChatMessage[]) => {
    setChatSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id === sessionId) {
          // Don't update title here - let the database handle it completely
          // The loadSessions call will fetch the updated title from the database
          return {
            ...session,
            messages,
            lastMessageDate: new Date()
          };
        }
        return session;
      })
    );
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Retry function to regenerate AI response
  const retryMessage = async (messageIndex: number) => {
    if (messageIndex < 1) return; // Can't retry if there's no user message before

    const userMessage = currentChat[messageIndex - 1];
    if (userMessage.role !== "user") return;

    // Remove the AI response and any subsequent messages
    const chatUpToUser = currentChat.slice(0, messageIndex);
    setCurrentChat(chatUpToUser);

    // Update session with truncated chat
    if (activeSessionId) {
      updateSessionMessages(activeSessionId, chatUpToUser);
    }

    setIsSubmitting(true);

    // Add thinking indicator
    const thinkingMessage: ChatMessage = {
      role: "assistant",
      content: "THINKING_INDICATOR",
      timestamp: new Date(),
      id: "thinking-" + Date.now().toString()
    };

    const chatWithThinking = [...chatUpToUser, thinkingMessage];
    setCurrentChat(chatWithThinking);

    try {
      let filePayload: { name: string; type: string; data: string } | undefined;

      // If the user message had an attachment, prepare it again
      if (userMessage.attachment && userMessage.attachment.url) {
        // For retry, we'll need to handle the attachment differently since we don't have the original file
        // For now, we'll skip the attachment in retry
        console.warn('Attachment not included in retry - original file not available');
      }

      const res = await fetch("/api/doubt-solving", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [userMessage], // Only send the specific user message for retry
          file: filePayload,
          sessionId: activeSessionId
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      const aiMessage: ChatMessage = {
        role: "assistant",
        content: data.reply || "Sorry, I couldn't generate a response.",
        timestamp: new Date(),
        id: Date.now().toString()
      };

      // Replace the thinking message with the actual response
      const finalChat = [...chatUpToUser, aiMessage];
      setCurrentChat(finalChat);

      if (activeSessionId) {
        updateSessionMessages(activeSessionId, finalChat);
        setTimeout(() => loadSessions(true), 500);
      }

      setTimeout(ensureLatexRendered, 100);
      setTimeout(ensureLatexRendered, 500);
    } catch (err) {
      console.error("Error retrying message:", err);

      const errorMessage: ChatMessage = {
        role: "assistant",
        content: err instanceof Error
          ? `Error: ${err.message}`
          : "Oops! Something went wrong while generating a response.",
        timestamp: new Date(),
        id: Date.now().toString()
      };

      const errorChat = [...chatUpToUser, errorMessage];
      setCurrentChat(errorChat);

      if (activeSessionId) {
        updateSessionMessages(activeSessionId, errorChat);
      }
    } finally {
      setIsSubmitting(false);
      setTimeout(() => scrollToBottom(true), 100);
    }
  };

  // Process text to render LaTeX and Markdown
  const renderContent = (content: string): string => {
    // Create unique tokens for LaTeX that won't be affected by markdown processing
    const latexTokens: { [key: string]: { formula: string, isDisplay: boolean } } = {};

    // First handle LaTeX expressions to protect them from Markdown processing
    // Handle both regular LaTeX and numbered equations
    let processedContent = content.replace(/\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)|\$\$([\s\S]*?)\$\$|\$((?!\$)[\s\S]*?)\$/g, (match, displayBracket, inlineParen, display, inline) => {
      try {
        const isDisplay = match.startsWith('$$') || match.startsWith('\\[');
        const formula = displayBracket || display || inlineParen || inline;

        if (!formula || formula.trim() === '') {
          return match; // Return original for empty formulas
        }

        // Generate unique ID and token that won't be affected by markdown processing
        const id = `latex-${Math.random().toString(36).substr(2, 9)}`;
        const token = `__LATEX_TOKEN_${id}__`;

        // Store the formula and display mode for later
        latexTokens[token] = { formula, isDisplay };

        // Return token placeholder that won't be affected by markdown
        return token;
      } catch (error) {
        console.error('LaTeX rendering error:', error);
        return match; // Return original on error
      }
    });

    // Then handle Markdown formatting
    // Convert bold (**text**) to <strong>text</strong>
    processedContent = processedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convert italic (*text*) to <em>text</em>
    processedContent = processedContent.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Convert inline code (`text`) to <code>text</code>
    processedContent = processedContent.replace(/`([^`]+)`/g, '<code class="inline-code text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">$1</code>');

    // Convert code blocks (```text```) to <pre><code>text</code></pre>
    processedContent = processedContent.replace(/```(?:(\w+)\n)?([\s\S]*?)```/g, (match, language, code) => {
      const languageClass = language ? ` language-${language}` : '';
      return `<div class="bg-gray-100 dark:bg-gray-800 rounded-md my-3 overflow-x-auto"><pre class="p-4 text-sm overflow-x-auto"><code class="text-gray-900 dark:text-gray-100${languageClass}">${code.trim()}</code></pre></div>`;
    });

    // Convert lists
    // Unordered lists
    processedContent = processedContent.replace(/^- (.*?)$/gm, '<li class="ml-5 list-disc">$1</li>');
    processedContent = processedContent.replace(/(<li.*<\/li>(\n|$))+/g, '<ul class="my-3">$&</ul>');

    // Ordered lists
    processedContent = processedContent.replace(/^\d+\. (.*?)$/gm, '<li class="ml-5 list-decimal">$1</li>');
    processedContent = processedContent.replace(/(<li class="ml-5 list-decimal">.*<\/li>(\n|$))+/g, '<ol class="my-3">$&</ol>');

    // Convert headings (# Heading)
    processedContent = processedContent.replace(/^# (.*?)$/gm, '<h1 class="text-xl font-bold my-3">$1</h1>');
    processedContent = processedContent.replace(/^## (.*?)$/gm, '<h2 class="text-lg font-bold my-2">$1</h2>');
    processedContent = processedContent.replace(/^### (.*?)$/gm, '<h3 class="text-md font-bold my-2">$1</h3>');

    // Convert links [text](url)
    processedContent = processedContent.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline">$1</a>');

    // Convert paragraphs (lines with double newlines)
    processedContent = processedContent.replace(/\n\n/g, '</p><p class="mb-4">');

    // Handle single line breaks
    processedContent = processedContent.replace(/\n/g, '<br>');

    // Wrap the content in a paragraph if it's not already
    if (!processedContent.startsWith('<')) {
      processedContent = '<p class="mb-4">' + processedContent + '</p>';
    }

    // Finally, replace the LaTeX tokens with actual span elements
    Object.entries(latexTokens).forEach(([token, { formula, isDisplay }]) => {
      const id = token.replace('__LATEX_TOKEN_', '').replace('__', '');
      // We'll add a special data attribute to help with re-rendering
      const span = `<span id="${id}" class="latex-formula" data-formula="${encodeURIComponent(formula)}" data-display="${isDisplay}" data-latex-processed="false"></span>`;
      processedContent = processedContent.replace(token, span);
    });

    return processedContent;
  };

  // After rendering, find and process all LaTeX formulas
  useEffect(() => {
    const renderLatexFormulas = () => {
      document.querySelectorAll('.latex-formula').forEach(el => {
        try {
          const formula = decodeURIComponent((el as HTMLElement).dataset.formula || '');
          const isDisplay = (el as HTMLElement).dataset.display === 'true';

          if (!formula || formula.trim() === '') return;

          katex.render(formula, el as HTMLElement, {
            displayMode: isDisplay,
            throwOnError: false,
            output: 'html',
            trust: true,
            strict: false,
            macros: {
              "\\f": "f(#1)",
              "\\R": "\\mathbb{R}",
              "\\N": "\\mathbb{N}",
              "\\Z": "\\mathbb{Z}",
              "\\Q": "\\mathbb{Q}",
              "\\C": "\\mathbb{C}",
              "\\vec": "\\overrightarrow{#1}",
              "\\norm": "\\left\\|#1\\right\\|",
              "\\abs": "\\left|#1\\right|",
              "\\floor": "\\left\\lfloor#1\\right\\rfloor",
              "\\ceil": "\\left\\lceil#1\\right\\rceil"
            }
          });
        } catch (error) {
          console.error('KaTeX rendering error:', error);
          const formula = decodeURIComponent((el as HTMLElement).dataset.formula || '');
          const isDisplay = (el as HTMLElement).dataset.display === 'true';
          (el as HTMLElement).textContent = isDisplay ? `$$${formula}$$` : `$${formula}$`;
        }
      });
    };

    // Use multiple timeouts to ensure rendering happens after DOM updates
    const timeoutIds = [
      setTimeout(renderLatexFormulas, 100),
      setTimeout(renderLatexFormulas, 300),
      setTimeout(renderLatexFormulas, 500),
      setTimeout(renderLatexFormulas, 1000)
    ];

    // Also set up a MutationObserver to render LaTeX when DOM changes
    if (chatContainerRef.current) {
      const observer = new MutationObserver(() => {
        // If there are any changes to the DOM, re-render LaTeX
        setTimeout(renderLatexFormulas, 100);
      });

      // Observe the chat container for changes
      observer.observe(chatContainerRef.current, {
        childList: true,
        subtree: true,
        characterData: true
      });

      // Cleanup function to disconnect observer
      return () => {
        timeoutIds.forEach(id => clearTimeout(id));
        observer.disconnect();
      };
    }

    return () => timeoutIds.forEach(id => clearTimeout(id));
  }, [currentChat]);

  // Add a function to ensure LaTeX is rendered
  const ensureLatexRendered = () => {
    // Find all unprocessed LaTeX elements and render them
    document.querySelectorAll('.latex-formula[data-latex-processed="false"]').forEach(el => {
      try {
        const formula = decodeURIComponent((el as HTMLElement).dataset.formula || '');
        const isDisplay = (el as HTMLElement).dataset.display === 'true';

        if (!formula || formula.trim() === '') return;

        katex.render(formula, el as HTMLElement, {
          displayMode: isDisplay,
          throwOnError: false,
          output: 'html',
          trust: true,
          strict: false,
          macros: {
            "\\f": "f(#1)",
            "\\R": "\\mathbb{R}",
            "\\N": "\\mathbb{N}",
            "\\Z": "\\mathbb{Z}",
            "\\Q": "\\mathbb{Q}",
            "\\C": "\\mathbb{C}",
            "\\vec": "\\overrightarrow{#1}",
            "\\norm": "\\left\\|#1\\right\\|",
            "\\abs": "\\left|#1\\right|",
            "\\floor": "\\left\\lfloor#1\\right\\rfloor",
            "\\ceil": "\\left\\lceil#1\\right\\rceil"
          }
        });

        // Mark as processed
        (el as HTMLElement).setAttribute('data-latex-processed', 'true');
      } catch (error) {
        console.error('KaTeX rendering error:', error);
        const formula = decodeURIComponent((el as HTMLElement).dataset.formula || '');
        const isDisplay = (el as HTMLElement).dataset.display === 'true';
        (el as HTMLElement).textContent = isDisplay ? `$$${formula}$$` : `$${formula}$`;
      }
    });
  };

  // Render LaTeX when component is first mounted
  useEffect(() => {
    ensureLatexRendered();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Force scroll to bottom before adding new message
    scrollToBottom(true);

    // Create a new session if none is active
    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      currentSessionId = await createNewSession();
      // If session creation failed, return early
      if (!currentSessionId) {
        setIsSubmitting(false);
        return;
      }
    }

    setIsSubmitting(true);

    // Store the current query and attachment before clearing them
    const currentQuery = query;
    const currentAttachment = uploadedFile;
    const currentAttachmentPreview = attachmentPreview;

    // Clear the input and attachment immediately
    setQuery("");
    setUploadedFile(null);
    setAttachmentPreview(null);

    // Add user message to chat
    const userMessage: ChatMessage = {
      role: "user",
      content: currentQuery,
      timestamp: new Date(),
      id: Date.now().toString(),
      attachment: currentAttachment ? {
        type: currentAttachment.type,
        name: currentAttachment.name,
        url: currentAttachment.type.startsWith('image/') ? currentAttachment.url : (currentAttachmentPreview || ''),
        size: currentAttachment.size
      } : undefined
    };

    const updatedChat = [...currentChat, userMessage];

    setCurrentChat(updatedChat);

    // Scroll to the bottom after adding the user message
    setTimeout(() => scrollToBottom(), 100);

    // Update the session with the user message
    if (currentSessionId) {
      updateSessionMessages(currentSessionId, updatedChat);
    }

    // Add thinking indicator
    const thinkingMessage: ChatMessage = {
      role: "assistant",
      content: "THINKING_INDICATOR", // Special marker for animated thinking
      timestamp: new Date(),
      id: "thinking-" + Date.now().toString()
    };

    const chatWithThinking = [...updatedChat, thinkingMessage];
    setCurrentChat(chatWithThinking);

    // Scroll to the bottom after adding the thinking message
    setTimeout(() => scrollToBottom(), 100);

    try {
      let filePayload: { name: string; type: string; url: string } | undefined;

      if (currentAttachment) {
        filePayload = {
          name: currentAttachment.name,
          type: currentAttachment.type,
          url: currentAttachment.url
        };
      }

      // Check file size before sending to API (this is now handled by upload component)
      // But we'll keep this as additional validation
      if (filePayload && currentAttachment && currentAttachment.size > 10 * 1024 * 1024) {
        const sizeErrorMessage: ChatMessage = {
          role: "system",
          content: "File is too large. Please use a file smaller than 10MB.",
          timestamp: new Date(),
          id: Date.now().toString()
        };

        // Replace thinking message with error message
        const errorChat = [...updatedChat, sizeErrorMessage];
        setCurrentChat(errorChat);
        if (currentSessionId) {
          updateSessionMessages(currentSessionId, errorChat);
        }

        setIsSubmitting(false);
        return;
      }

      const res = await fetch("/api/doubt-solving", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedChat,
          file: filePayload,
          sessionId: currentSessionId
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      const aiMessage: ChatMessage = {
        role: "assistant",
        content: data.reply || "Sorry, I couldn't generate a response.",
        timestamp: new Date(),
        id: Date.now().toString()
      };

      // Replace the thinking message with the actual response
      const finalChat = [...updatedChat, aiMessage];
      setCurrentChat(finalChat);

      if (currentSessionId) {
        updateSessionMessages(currentSessionId, finalChat);
        // Always reload sessions after a successful message to get updated title
        // But preserve the current session's messages
        setTimeout(() => loadSessions(true), 500); // Delay to ensure DB update is complete
      }

      // Ensure LaTeX gets rendered after the response
      setTimeout(ensureLatexRendered, 100);
      setTimeout(ensureLatexRendered, 500);
    } catch (err) {
      console.error("Error submitting doubt:", err);

      const errorMessage: ChatMessage = {
        role: "assistant",
        content: err instanceof Error
          ? `Error: ${err.message}`
          : "Oops! Something went wrong while generating a response.",
        timestamp: new Date(),
        id: Date.now().toString()
      };

      // Replace thinking message with error message
      const errorChat = [...updatedChat, errorMessage];
      setCurrentChat(errorChat);

      if (currentSessionId) {
        updateSessionMessages(currentSessionId, errorChat);
        // Always reload sessions after a message to get updated title
        // But preserve the current session's messages
        setTimeout(() => loadSessions(true), 500); // Delay to ensure DB update is complete
      }
    } finally {
      setIsSubmitting(false);
      // Focus back on textarea
      textareaRef.current?.focus();

      // Ensure we scroll to the bottom after all processing
      setTimeout(() => scrollToBottom(true), 100);
      setTimeout(() => scrollToBottom(true), 300);
      setTimeout(() => scrollToBottom(true), 1000);
    }
  };

  const handleFileUploaded = (file: {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    downloadUrl: string;
    previewUrl?: string;
  }) => {
    setUploadedFile(file);
  };

  const handleFileRemoved = () => {
    setUploadedFile(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isSubmitting && query.trim()) {
        handleSubmit(e);
      }
    }
  };

  // Resize functionality
  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  const resize = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 500) {
        setSidebarWidth(newWidth);
      }
    }
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', stopResizing);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResizing);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResizing);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  // Load sessions on component mount
  useEffect(() => {
    loadSessions(false); // Don't preserve on initial load
  }, [loadSessions]);

  // Set up mutation observer to detect when messages are added to the DOM
  useEffect(() => {
    if (!chatContainerRef.current) return;

    // Create a mutation observer to watch for changes in the chat container
    const observer = new MutationObserver((mutations) => {
      // If messages were added, scroll to bottom
      if (mutations.some(m => m.addedNodes.length > 0)) {
        scrollToBottom(true);
      }
    });

    // Start observing the chat container for DOM changes
    observer.observe(chatContainerRef.current, {
      childList: true,
      subtree: true
    });

    // Cleanup function
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white dark:bg-gray-900">
      {/* Full-width Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between py-3 px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700" style={{ margin: 0, paddingBottom: 0, height: '60px' }}>
        <div className="flex items-center gap-4 align-middle">
          <a
            href="/home"
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </a>

          <span className="font-semibold text-gray-900 dark:text-white text-lg">AI Doubt Solver</span>
        </div>

        <div className="flex items-center gap-4 align-middle">
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative" style={{ margin: 0, padding: 0, background: 'transparent' }}>
        {/* Sidebar */}
        <div
          className="sidebar-container h-full overflow-y-auto scrollbar-enhanced bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col border-r border-gray-200 dark:border-gray-700"
          style={{ width: `${sidebarWidth}px` }}
        >
          {/* Resize Handle */}
          <div
            ref={resizeRef}
            className={`resize-handle ${isResizing ? 'resizing' : ''}`}
            onMouseDown={startResizing}
          />
          {/* New Chat button */}
          <div className="p-3">
            <button
              onClick={createNewSession}
              className="flex items-center gap-3 w-full rounded-lg py-3 px-4 text-gray-700 dark:text-white bg-gradient-to-r from-gray-200 to-gray-300 dark:from-emerald-600 dark:to-teal-600 hover:from-gray-300 hover:to-gray-400 dark:hover:from-emerald-700 dark:hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium button-3d"
            >
              <Plus className="h-5 w-5 text-gray-600 dark:text-white" />
              <span className="text-gray-700 dark:text-white">New Chat</span>
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-thin">
            <div className="flex flex-col gap-1 text-sm">
              {isLoadingSessions ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 dark:border-cyan-400"></div>
                  <span className="ml-2 text-gray-600 dark:text-gray-300 font-medium">Loading sessions...</span>
                </div>
              ) : chatSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No chat sessions yet</p>
                  <p className="text-sm mt-1">Start a new conversation!</p>
                </div>
              ) : (
                chatSessions.map(session => (
                  <div
                    key={session.id}
                    onClick={() => switchSession(session.id)}
                    className={`
                  group py-3 px-3 rounded-lg cursor-pointer flex justify-between items-center mx-2 mb-2
                  ${session.id === activeSessionId
                        ? 'bg-gradient-to-r from-gray-300 to-gray-400 dark:from-purple-600 dark:to-indigo-600 shadow-lg'
                        : 'hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:shadow-md'
                      }
                  transition-all duration-200 transform hover:scale-105
                `}
                  >
                    <div className="truncate flex items-center gap-2">
                      <span className="flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </span>
                      <span className="truncate text-gray-700 dark:text-white">{session.title}</span>
                    </div>
                    <button
                      onClick={(e) => deleteSession(session.id, e)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Main content area */}
        <div
          className="main-content flex flex-col bg-white dark:bg-gray-900"
          style={{
            left: `${sidebarWidth}px`,
            width: `calc(100% - ${sidebarWidth}px)`,
            top: '0px',
            margin: 0,
            padding: 0,
            height: '100%',
            position: 'absolute',
            overflow: 'hidden',
            border: 'none',
            outline: 'none',
            boxShadow: 'none'
          }}
        >

          {/* Main chat area with scrollable content */}
          {isLoadingMessages ? (
            <div className="flex items-center justify-center flex-1">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300 font-medium">Loading messages...</span>
            </div>
          ) : currentChat.length === 0 ? (
            <div className="empty-screen" style={{ padding: 0, margin: 0 }}>
              {/* ChatGPT-style welcome screen */}
              <div className="text-center">
                <h1 className="text-10xl font-bold text-gray-900 dark:text-white mb-8">AI Doubt Solver</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-none mx-auto w-full px-4">
                  <div className="p-4 rounded-lg text-center group">
                    <div className="h-14 w-14 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                      <Stars className="h-7 w-7 text-gray-500 dark:text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">Need help with a concept?</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Get explanations for complex topics</p>
                    <button
                      onClick={() => setQuery("Explain the concept of quantum entanglement")}
                      className="text-xs text-gray-600 dark:text-gray-400 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      &quot;Explain quantum entanglement&quot;
                    </button>
                  </div>
                  <div className="p-4 rounded-lg text-center group">
                    <div className="h-14 w-14 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                      <InfoIcon className="h-7 w-7 text-gray-500 dark:text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">Solve a math problem</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Get step-by-step solutions</p>
                    <button
                      onClick={() => setQuery("Solve the equation: 3x² + 6x - 9 = 0")}
                      className="text-xs text-gray-600 dark:text-gray-400 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      &quot;Solve the equation: 3x² + 6x - 9 = 0&quot;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="message-list"
              ref={chatContainerRef}
              onScroll={handleScroll}
              data-testid="message-list"
            >
              {currentChat.map((message, index) => (
                <div key={message.id || index}>
                  <div className={`chat-row ${message.role} message-container relative`}>
                    <div className="flex items-start w-full relative">
                      {message.role === "assistant" && (
                        <div className="chat-avatar assistant">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white">
                            <path d="M15.4695 8.32446L15.005 7.85999L15.4695 8.32446ZM18.1762 9.22549L18.6407 9.68995L18.1762 9.22549ZM6.53033 5.93993L7.03033 6.44L6.53033 5.93993ZM5.06066 7.40961L4.56066 6.90954L5.06066 7.40961ZM8.93934 11.2883L9.43934 11.7884H9.43934L8.93934 11.2883ZM5.06066 11.2883L4.56066 11.7884L5.06066 11.2883ZM11.3327 9.93395L10.8327 9.43388L11.3327 9.93395ZM9.4485 12.7307L9.9485 13.2308L9.4485 12.7307ZM12.142 15.4352L11.642 14.9351L12.142 15.4352ZM9.42863 18.1487L8.92863 17.6486L9.42863 18.1487ZM6.53033 15.2519L7.03033 14.7518L6.53033 15.2519ZM15.9907 10.4199L17.0113 9.48546L16.0822 8.47576L15.0617 9.41024L15.9907 10.4199ZM14.944 7.39553L14.0113 8.35446L14.9403 9.36416L15.873 8.40522L14.944 7.39553ZM13.5907 13.4113L14.5732 12.5176L13.6988 11.4549L12.7162 12.3486L13.5907 13.4113ZM14.5732 11.4549L13.5907 10.5612L12.7162 11.6239L13.6988 12.5176L14.5732 11.4549ZM7.03033 6.44L8.43934 7.84901L9.43934 6.84901L8.03033 5.43993L7.03033 6.44ZM4.56066 6.90954L6.03033 5.43986L5.03033 4.43986L3.56066 5.90954L4.56066 6.90954ZM8.43934 10.7883L5.56066 7.90961L4.56066 8.90961L7.43934 11.7883L8.43934 10.7883ZM5.56066 11.7884L8.43934 14.6671L9.43934 13.6671L6.56066 10.7883L5.56066 11.7884ZM11.8327 10.434L9.43934 12.8273L10.4393 13.8273L12.8327 11.434L11.8327 10.434ZM10.8327 9.43388L9.43934 10.8273L10.4393 11.8273L11.8327 10.434L10.8327 9.43388ZM12.642 15.9353L14.1117 17.405L15.1117 16.405L13.642 14.9351L12.642 15.9353ZM14.1117 17.405L15.5664 18.8596L16.5664 17.8596L15.1117 16.405L14.1117 17.405ZM9.92863 18.6487L12.8073 21.5274L13.8073 20.5274L10.9286 17.6487L9.92863 18.6487ZM6.03033 14.7518L3.15166 17.6305L4.15166 18.6305L7.03033 15.7518L6.03033 14.7518ZM9.43934 13.6671L6.03033 17.0761L7.03033 18.0761L10.4393 14.6671L9.43934 13.6671ZM9.9485 13.2308L11.642 14.9351L12.642 13.9351L10.9485 12.2308L9.9485 13.2308ZM8.92863 17.6486L7.53033 16.2503L6.53033 17.2503L7.92863 18.6487L8.92863 17.6486ZM15.873 8.40522L17.7117 6.7318L16.7828 5.72211L14.944 7.39553L15.873 8.40522ZM17.7117 5.72211L16.7828 6.7318L17.7117 6.7318L17.7117 5.72211ZM18.6407 9.68995L20.4795 8.01653L19.5505 7.00684L17.7117 8.68026L18.6407 9.68995ZM17.7117 8.68026L15.9404 7.01684L15.9403 8.02653L17.7117 9.68995L17.7117 8.68026ZM15.0617 9.41024L13.6988 10.6429L14.6277 11.6526L15.9907 10.4199L15.0617 9.41024ZM14.6277 12.4253L15.0617 13.6177L16.3572 12.4253L15.9233 11.2328L14.6277 12.4253ZM11.8327 11.434L10.9485 12.2308L11.642 13.9351L12.8327 12.9351L11.8327 11.434ZM14.6179 14.9352L15.0617 13.6177L13.7662 12.4253L13.3223 13.7428L14.6179 14.9352ZM14.6179 14.9352L13.9338 15.5498L14.9338 16.5498L15.6179 15.9352L14.6179 14.9352ZM10.4393 13.8273L12.642 15.9351L13.642 14.9351L11.4393 12.8273L10.4393 13.8273ZM7.43934 11.7883L8.43934 11.7884L8.43934 10.7883L7.43934 10.7883L7.43934 11.7883ZM16.744 8.02655L17.7117 8.01653L16.7828 7.00684L15.815 7.01687L16.744 8.02655ZM15.005 7.85999L15.815 7.01687L14.886 6.00717L14.0761 6.85029L15.005 7.85999ZM16.0822 8.47576L15.4695 8.32446L14.5405 9.33416L15.1533 9.48546L16.0822 8.47576ZM14.0113 8.35446L13.5907 8.73565L14.5197 9.74534L14.9403 9.36416L14.0113 8.35446ZM13.6988 11.4549L13.6988 12.5176L14.6277 12.5176L14.6277 11.4549L13.6988 11.4549ZM8.43934 7.84901V10.7883H9.43934V7.84901H8.43934ZM8.43934 10.8273V10.7883H7.43934V10.8273H8.43934ZM13.5907 8.73565L12.7162 9.50931L13.6452 10.519L14.5197 9.7453L13.5907 8.73565ZM12.7162 9.50931L9.43934 12.8273L10.4393 13.8273L13.7162 10.5093L12.7162 9.50931ZM7.43934 10.7883C7.43934 10.9266 7.38958 11.0592 7.30084 11.1635L8.22126 11.9436C8.50265 11.6041 8.6546 11.1637 8.6546 10.7883H7.43934ZM7.30084 11.1635C7.2121 11.2678 7.08577 11.3293 6.95388 11.3396L7.07652 12.6541C7.60406 12.613 8.09823 12.3657 8.50265 11.9436L7.30084 11.1635ZM6.95388 11.3396C6.82199 11.35 6.68676 11.3079 6.58208 11.2203L5.7332 12.0694C6.06181 12.3525 6.46724 12.4929 6.84416 12.5477L6.95388 11.3396ZM6.58208 11.2203C6.4774 11.1326 6.41386 11.0056 6.40662 10.8699L5.09384 10.9581C5.11557 11.3653 5.30651 11.7495 5.7332 12.0694L6.58208 11.2203ZM6.40662 10.8699C6.39939 10.7341 6.44932 10.6L5.21954 10.2L4.89946 10.9963C4.99539 11.2303 5.07211 11.551 5.09384 11.9581L6.40662 10.8699ZM6.44932 10.6C6.4939 10.4719 6.57262 10.3654 6.68116 10.2826L5.89798 9.3826C5.57234 9.63386 5.33832 9.96923 5.21954 10.2L6.44932 10.6ZM6.68116 10.2826C6.79434 10.1954 6.93479 10.1341 7.16697 10.1341V8.8341C6.7758 8.8341 6.21899 8.92845 5.89798 9.3826L6.68116 10.2826ZM7.16697 10.1341H7.43934V8.8341H7.16697V10.1341Z" fill="currentColor"></path>
                          </svg>
                        </div>
                      )}

                      <div className={`message-bubble ${message.role === "assistant" ? "ai-bubble" : "user-bubble"}`}>
                        {message.role === "assistant" ? (
                          message.content === "THINKING_INDICATOR" ? (
                            <div className="flex items-center gap-3 py-2">
                              <span className="thinking-text">Thinking</span>
                              <div className="thinking-dots">
                                <div className="thinking-dot"></div>
                                <div className="thinking-dot"></div>
                                <div className="thinking-dot"></div>
                              </div>
                            </div>
                          ) : (
                            <div
                              className="message-content markdown-content"
                              dangerouslySetInnerHTML={{ __html: renderContent(message.content) }}
                            />
                          )
                        ) : (
                          <div>
                            {/* Show attachment if it exists */}
                            {message.attachment && (
                              <div className="mb-3">
                                {message.attachment.type.startsWith('image/') ? (
                                  message.attachment.url ? (
                                    <img
                                      src={message.attachment.url}
                                      alt="Uploaded image"
                                      className="max-w-full max-h-64 rounded-lg shadow-md"
                                    />
                                  ) : (
                                    <div className="flex items-center gap-2 p-3 bg-gray-200 dark:bg-white/10 rounded-lg border border-gray-300 dark:border-white/10">
                                      <Image className="w-5 h-5 text-gray-700 dark:text-white" />
                                      <span className="text-sm text-gray-700 dark:text-white">Image attached</span>
                                    </div>
                                  )
                                ) : message.attachment.type === 'application/pdf' ? (
                                  <div className="flex items-center gap-2 p-3 bg-gray-200 dark:bg-white/10 rounded-lg border border-gray-300 dark:border-white/10">
                                    <FileText className="w-5 h-5 text-gray-700 dark:text-white" />
                                    <span className="text-sm text-gray-700 dark:text-white">{message.attachment.name}</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 p-3 bg-gray-200 dark:bg-white/10 rounded-lg border border-gray-300 dark:border-white/10">
                                    <FileText className="w-5 h-5 text-gray-700 dark:text-white" />
                                    <span className="text-sm text-gray-700 dark:text-white">{message.attachment.name}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            {message.content && (
                              <p className="whitespace-pre-wrap break-words overflow-hidden mt-2">{message.content}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {message.role === "user" && (
                        <div className="chat-avatar user">
                          <User className="w-4 h-4 text-gray-900 dark:text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons positioned completely outside and below the chat row */}
                  {message.role === "assistant" && message.content !== "THINKING_INDICATOR" && (
                    <div className="w-full flex justify-end px-4 pb-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-white rounded hover:bg-gray-700 transition-all duration-200"
                          title="Copy message"
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3 w-3" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => retryMessage(index)}
                          disabled={isSubmitting}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-white rounded hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Retry message"
                        >
                          <RefreshCw className={`h-3 w-3 ${isSubmitting ? 'animate-spin' : ''}`} />
                          <span>{isSubmitting ? 'Retry...' : 'Retry'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div
                ref={messagesEndRef}
                style={{ float: 'left', clear: 'both', paddingBottom: '30px', width: '100%', height: '1px' }}
                data-testid="messages-end-ref"
              />
            </div>
          )}

          {/* Floating input area */}
          <div
            className="input-area"
            style={{
              position: 'fixed',
              bottom: '12px',
              left: `${sidebarWidth}px`,
              right: '0',
              display: 'flex',
              justifyContent: 'center',
              zIndex: 100
            }}
          >
            <div className="input-container relative">
              <form
                onSubmit={handleSubmit}
                className="relative"
              >
                {/* Show attachment if it exists */}
                {uploadedFile && (
                  <div className="attachment-preview p-3">
                    <div className="flex items-center justify-between">
                      {uploadedFile.type === 'application/pdf' ? (
                        <div className="flex items-center gap-3 flex-1">
                          <FileText className="w-5 h-5 text-red-600 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{uploadedFile.name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">PDF Document</p>
                          </div>
                        </div>
                      ) : uploadedFile.type.startsWith('image/') ? (
                        <div className="flex items-center gap-3 flex-1">
                          {uploadedFile.url ? (
                            <img
                              src={uploadedFile.url}
                              alt="Preview"
                              className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                              <Image className="w-6 h-6 text-gray-500" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{uploadedFile.name}</p>
                            <p className="text-xs text-gray-400">Image</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 flex-1">
                          <FileText className="w-5 h-5 text-gray-600 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{uploadedFile.name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Document</p>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={handleFileRemoved}
                        className="p-1 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors flex-shrink-0"
                        title="Remove attachment"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <textarea
                  ref={textareaRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything"
                  className={`resize-none w-full input-textarea focus:ring-0 focus:outline-none border-0 placeholder:text-gray-400 text-gray-900 dark:text-white py-3 pl-4 pr-24 ${uploadedFile ? 'rounded-b-xl' : 'rounded-xl'}`}
                  rows={3}
                />

                <div className="absolute right-3 bottom-2.5 flex items-center space-x-2">
                  {!uploadedFile && (
                    <label className="p-1.5 rounded-md cursor-pointer text-gray-400 hover:text-gray-200 transition-colors">
                      <Image className="w-4 h-4" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Create a simple file upload using our existing API
                            const formData = new FormData();
                            formData.append('file', file);

                            fetch('/api/upload', {
                              method: 'POST',
                              body: formData,
                            })
                              .then(response => response.json())
                              .then(result => {
                                if (result.success) {
                                  handleFileUploaded(result.file);
                                }
                              })
                              .catch(error => {
                                console.error('Upload error:', error);
                                alert('Failed to upload file');
                              });
                          }
                        }}
                      />
                    </label>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="p-1.5 rounded-md text-gray-700 dark:text-white bg-gray-300 dark:bg-green-600 hover:bg-gray-400 dark:hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Scroll to bottom button */}



        </div>
      </div>
    </div >
  );
}

// Removed unused subjects array 
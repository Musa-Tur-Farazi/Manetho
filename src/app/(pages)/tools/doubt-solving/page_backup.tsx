"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Image, Loader2, Plus, Bot, User, Trash2, Copy, Check, ArrowLeft, ExternalLink, Stars, Settings, LogOut, InfoIcon, FileText, ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import { Button } from "../../../../../components/ui/Button";
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
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chat management
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatMessage[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // UI state
  const [isCopied, setIsCopied] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false); // Start with dropdown closed
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // File preview state
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);

  // Function to scroll to the bottom of the chat
  const scrollToBottom = (instant: boolean = false) => {
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
  };

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
  const loadSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const response = await fetch('/api/doubt-solving/sessions');

      if (response.ok) {
        const data = await response.json();
        const dbSessions = data.sessions.map((session: any) => ({
          id: session.id,
          title: session.title,
          lastMessageDate: new Date(session.lastMessageDate),
          messages: [], // Will be loaded when session is selected
        }));
        setChatSessions(dbSessions);

        // If no active session and we have sessions, activate the first one
        if (!activeSessionId && dbSessions.length > 0) {
          setActiveSessionId(dbSessions[0].id);
          await loadMessages(dbSessions[0].id);
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
  };

  // Load messages for a specific session
  const loadMessages = async (sessionId: string) => {
    try {
      setIsLoadingMessages(true);
      const response = await fetch(`/api/doubt-solving/sessions/${sessionId}/messages`);

      if (response.ok) {
        const data = await response.json();
        const dbMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
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
  };

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
        background-color: #19c37d;
        color: white;
        border-radius: 12px;
        padding: 10px 14px;
        max-width: 90%;
        margin-left: auto;
        margin-right: 16px;
      }
      
      /* AI bubble styling */
      .ai-bubble {
        background-color: transparent;
        color: #d1d5db;
        border-radius: 0;
        padding: 0;
        max-width: 100%;
        margin-left: 16px;
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
      
      /* Improved copy button styles */
      .copy-button {
        opacity: 0;
        transition: opacity 0.2s ease;
      }
      
      .message-container:hover .copy-button {
        opacity: 1;
      }

      /* Improved send button styles */
      .send-button {
        background-color: #19c37d;
        color: white;
        border-radius: 6px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }
      
      .send-button:hover {
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
        border-bottom: 1px solid rgba(255,255,255,0.1);
        width: 100%;
      }
      
      .chat-row.user {
        background-color: #343541;
      }
      
      .chat-row.assistant {
        background-color: #444654;
      }
      
      .chat-row .flex {
        width: 100%;
        max-width: 90%;
        margin: 0 auto;
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
      
      /* Dropdown backdrop */
      .dropdown-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.3);
        z-index: 30;
        transition: opacity 0.3s ease;
      }
      
      .dropdown-backdrop.hidden {
        opacity: 0;
        pointer-events: none;
      }
      
      /* Resize handle */
      .resize-handle {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: linear-gradient(to right, transparent, rgba(59, 130, 246, 0.3), transparent);
        cursor: col-resize;
        z-index: 60;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .resize-handle:hover {
        background: linear-gradient(to right, transparent, rgba(59, 130, 246, 0.6), transparent);
        width: 8px;
      }
      
      .resize-handle.resizing {
        background: linear-gradient(to right, transparent, rgba(59, 130, 246, 0.9), transparent);
        width: 8px;
      }
      
      .resize-handle::before {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 2px;
        height: 30px;
        background: rgba(59, 130, 246, 0.8);
        border-radius: 1px;
        opacity: 0;
        transition: opacity 0.2s ease;
      }
      
      .resize-handle:hover::before,
      .resize-handle.resizing::before {
        opacity: 1;
      }
      
      /* Minimized sidebar */
      .sidebar-minimized {
        width: 60px !important;
        min-width: 60px !important;
      }
      
      .sidebar-minimized .sidebar-content {
        padding: 8px 4px;
      }
      
      .sidebar-minimized .chat-session-mini {
        width: 48px;
        height: 48px;
        margin: 4px auto;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
      }
      
      .sidebar-minimized .chat-session-mini.active {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      }
      
      .sidebar-minimized .chat-session-mini:not(.active) {
        background: rgba(255, 255, 255, 0.1);
      }
      
      .sidebar-minimized .chat-session-mini:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: scale(1.05);
      }
      
      .sidebar-minimized .chat-session-mini.active:hover {
        background: linear-gradient(135deg, #2563eb, #1e40af);
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
      .file-preview {
        max-height: 120px;
        border-radius: 8px;
        border: 2px solid rgba(59, 130, 246, 0.3);
        background: rgba(59, 130, 246, 0.1);
      }
      
      .file-preview-container {
        position: relative;
        display: inline-block;
      }
      
      .file-remove-btn {
        position: absolute;
        top: -8px;
        right: -8px;
        background: #ef4444;
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: all 0.2s ease;
      }
      
      .file-remove-btn:hover {
        background: #dc2626;
        transform: scale(1.1);
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
      
      /* Footer area */
      .footer-area {
        display: none;
      }
      
      /* Message bubble widths */
      .message-bubble {
        max-width: 80%;
      }
      
      /* Input area styling */
      .input-area {
        border-color: rgba(217,217,227,.15);
        background-color: transparent;
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
      }
      
      .input-container {
        max-width: 80%;
        margin: 0 auto;
      }
      
      .input-textarea {
        background-color: #40414f;
        border-radius: 0.75rem;
        color: white;
        resize: none;
        min-height: 56px;
        max-height: 300px;
      }
      
      /* Message list styling */
      .message-list {
        position: absolute;
        top: 49px; /* Height of header */
        bottom: 100px; /* Height of input area */
        left: 0;
        right: 0;
        overflow-y: auto;
        overflow-x: hidden;
        scroll-behavior: smooth;
        padding-bottom: 20px; /* Add padding to ensure last message is fully visible */
      }
      
      /* Scroll button */
      .scroll-bottom-button {
        position: fixed;
        bottom: 120px;
        right: 20px;
        background-color: rgba(32, 33, 35, 0.6);
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: opacity 0.3s;
        z-index: 20;
        opacity: 0;
        pointer-events: none;
      }
      
      .scroll-bottom-button.visible {
        opacity: 1;
        pointer-events: auto;
      }
      
      /* Message content wrap */
      .message-content-wrap {
        max-width: 90%;
        width: 100%;
        padding: 0 1rem;
      }
      
      /* Empty screen styling */
      .empty-screen {
        background-color: #343541;
        position: absolute;
        top: 49px;
        bottom: 100px;
        left: 0;
        right: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
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
  }, [currentChat]);

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

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
      try {
        const sessions = JSON.parse(savedSessions);
        setChatSessions(sessions);

        // Set the most recent session as active if available
        if (sessions.length > 0) {
          const sortedSessions = [...sessions].sort((a, b) =>
            new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime()
          );
          setActiveSessionId(sortedSessions[0].id);
          setCurrentChat(sortedSessions[0].messages);

          // Force scroll to bottom after loading messages
          setTimeout(() => scrollToBottom(true), 500);
        }
      } catch (e) {
        console.error("Error loading saved sessions:", e);
      }
    }
  }, []);

  // Save sessions to localStorage when they change
  useEffect(() => {
    if (chatSessions.length > 0) {
      localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    }
  }, [chatSessions]);

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

  const createNewSession = async () => {
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
    }

    if (isMobile) {
      setShowSidebar(false);
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

    try {
      // Delete from database
      const deleted = await deleteSessionFromDB(sessionId);

      if (deleted) {
        // Remove from local state regardless of database result
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
      } else {
        // Even if database deletion failed, remove from local state
        // This handles cases where the session might have been deleted elsewhere
        const updatedSessions = chatSessions.filter(s => s.id !== sessionId);
        setChatSessions(updatedSessions);

        if (sessionId === activeSessionId) {
          if (updatedSessions.length > 0) {
            setActiveSessionId(updatedSessions[0].id);
            await loadMessages(updatedSessions[0].id);
          } else {
            await createNewSession();
          }
        }

        console.warn('Session removed from local state, but database deletion may have failed');
      }
    } catch (error) {
      console.error('Error during session deletion:', error);

      // Still try to remove from local state as a fallback
      const updatedSessions = chatSessions.filter(s => s.id !== sessionId);
      setChatSessions(updatedSessions);

      if (sessionId === activeSessionId) {
        if (updatedSessions.length > 0) {
          setActiveSessionId(updatedSessions[0].id);
          await loadMessages(updatedSessions[0].id);
        } else {
          await createNewSession();
        }
      }
    }
  };

  // Generate title for a new chat based on the first message
  const generateChatTitle = (message: string): string => {
    const maxLength = 30;
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  // Update session with new messages
  const updateSessionMessages = (sessionId: string, messages: ChatMessage[]) => {
    setChatSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id === sessionId) {
          // Update title if this is the first user message
          let title = session.title;
          if (session.messages.length === 0 && messages.length > 0 && messages[0].role === 'user') {
            title = generateChatTitle(messages[0].content);
          }

          return {
            ...session,
            title,
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

  // Process text to render LaTeX and Markdown
  const renderContent = (content: string): string => {
    // Create unique tokens for LaTeX that won't be affected by markdown processing
    const latexTokens: { [key: string]: { formula: string, isDisplay: boolean } } = {};

    // First handle LaTeX expressions to protect them from Markdown processing
    let processedContent = content.replace(/\$\$([\s\S]*?)\$\$|\$((?!\$)[\s\S]*?)\$/g, (match, display, inline) => {
      try {
        const isDisplay = match.startsWith('$$');
        const formula = isDisplay ? display : inline;

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
    processedContent = processedContent.replace(/`([^`]+)`/g, '<code class="inline-code text-white bg-gray-700 px-1 py-0.5 rounded">$1</code>');

    // Convert code blocks (```text```) to <pre><code>text</code></pre>
    processedContent = processedContent.replace(/```(?:(\w+)\n)?([\s\S]*?)```/g, (match, language, code) => {
      return `<div class="bg-gray-800 rounded-md my-3 overflow-x-auto"><pre class="p-4 text-sm overflow-x-auto"><code>${code.trim()}</code></pre></div>`;
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
            macros: {
              "\\f": "f(#1)"
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
      const observer = new MutationObserver((mutations) => {
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
          macros: {
            "\\f": "f(#1)"
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const result = reader.result as string;
          // Strip the data:*/*;base64, prefix to reduce payload size.
          const base64 = result.split(",")[1] ?? "";
          resolve(base64);
        } catch (error) {
          console.error("Error processing file:", error);
          reject(error);
        }
      };
      reader.onerror = (event) => {
        console.error("FileReader error:", event);
        reject(new Error("Failed to read file"));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Force scroll to bottom before adding new message
    scrollToBottom(true);

    // Create a new session if none is active
    if (!activeSessionId) {
      createNewSession();
    }

    setIsSubmitting(true);

    // Store the current query before clearing it
    const currentQuery = query;

    // Clear the input immediately
    setQuery("");

    // Add user message to chat
    const userMessage: ChatMessage = {
      role: "user",
      content: currentQuery,
      timestamp: new Date(),
      id: Date.now().toString(),
      attachment: attachment ? {
        type: attachment.type,
        name: attachment.name,
        url: attachmentPreview === 'pdf' ? '' : (attachmentPreview || '')
      } : undefined
    };

    const updatedChat = [...currentChat, userMessage];
    setCurrentChat(updatedChat);

    // Scroll to the bottom after adding the user message
    setTimeout(() => scrollToBottom(), 100);

    // Update the session with the user message
    if (activeSessionId) {
      updateSessionMessages(activeSessionId, updatedChat);
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
      let filePayload: { name: string; type: string; data: string } | undefined;

      if (attachment) {
        try {
          const base64 = await fileToBase64(attachment);
          filePayload = {
            name: attachment.name,
            type: attachment.type,
            data: base64
          };
        } catch (fileError) {
          console.error("File conversion error:", fileError);

          // Add error message to chat
          const errorMessage: ChatMessage = {
            role: "system",
            content: "There was a problem processing your file. Please try a different file or format.",
            timestamp: new Date(),
            id: Date.now().toString()
          };

          // Replace thinking message with error message
          const errorChat = [...updatedChat, errorMessage];
          setCurrentChat(errorChat);
          if (activeSessionId) {
            updateSessionMessages(activeSessionId, errorChat);
          }

          setIsSubmitting(false);
          return;
        }
      }

      // Check file size before sending to API
      if (filePayload && filePayload.data.length > 10 * 1024 * 1024) {
        const sizeErrorMessage: ChatMessage = {
          role: "system",
          content: "File is too large. Please use a file smaller than 10MB.",
          timestamp: new Date(),
          id: Date.now().toString()
        };

        // Replace thinking message with error message
        const errorChat = [...updatedChat, sizeErrorMessage];
        setCurrentChat(errorChat);
        if (activeSessionId) {
          updateSessionMessages(activeSessionId, errorChat);
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
      const finalChat = [...updatedChat, aiMessage];
      setCurrentChat(finalChat);

      if (activeSessionId) {
        updateSessionMessages(activeSessionId, finalChat);
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

      if (activeSessionId) {
        updateSessionMessages(activeSessionId, errorChat);
      }
    } finally {
      setIsSubmitting(false);
      setAttachment(null);
      setAttachmentPreview(null);
      // Focus back on textarea
      textareaRef.current?.focus();

      // Ensure we scroll to the bottom after all processing
      setTimeout(() => scrollToBottom(true), 100);
      setTimeout(() => scrollToBottom(true), 300);
      setTimeout(() => scrollToBottom(true), 1000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert("File is too large. Please select a file smaller than 10MB.");
        e.target.value = '';
        return;
      }

      setAttachment(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setAttachmentPreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        // For PDFs, we'll show a PDF icon
        setAttachmentPreview('pdf');
      }
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isSubmitting && query.trim()) {
        handleSubmit(e);
      }
    }
  };



  // Load sessions on component mount
  useEffect(() => {
    loadSessions();
  }, []);

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
    <div className="h-screen w-screen overflow-hidden bg-gray-900">
      {/* Backdrop */}
      <div
        className={`dropdown-backdrop ${!showSidebar ? 'hidden' : ''}`}
        onClick={() => setShowSidebar(false)}
      />

      {/* Sidebar Dropdown */}
      <div
        className={`fixed top-16 right-4 z-40 w-80 max-h-[calc(100vh-5rem)] bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-lg shadow-2xl border border-gray-700 transition-all duration-300 transform ${showSidebar ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95 pointer-events-none'
          }`}
      >

        {/* Dropdown Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">Chat History</h3>
            <button
              onClick={() => setShowSidebar(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* New Chat button */}
          <button
            onClick={createNewSession}
            className="flex items-center gap-3 w-full rounded-lg py-3 px-4 text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
          >
            <Plus className="h-5 w-5 text-white flex-shrink-0" />
            <span className="text-white">New Chat</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-1 text-sm">
              {isLoadingSessions ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
                  <span className="ml-2 text-gray-300 font-medium">Loading sessions...</span>
                </div>
              ) : chatSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No chat sessions yet</p>
                  <p className="text-sm mt-1">Start a new conversation!</p>
                </div>
              ) : (
                chatSessions.map(session => (
                  <div
                    key={session.id}
                    onClick={() => {
                      switchSession(session.id);
                      setShowSidebar(false); // Close dropdown after selection
                    }}
                    className={`
                    group py-3 px-3 rounded-lg cursor-pointer flex justify-between items-center mb-2
                    ${session.id === activeSessionId
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg'
                        : 'hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 hover:shadow-md'
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
                      <span className="truncate">{session.title}</span>
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
      </div>

      {/* Main content area */}
      <div className="flex flex-col h-screen w-full pt-16 bg-gray-900">
        {/* Full-width Header */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between py-3 px-6 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 shadow-lg border-b border-slate-600">
          <div className="flex items-center gap-4">
            <a
              href="/home"
              className="p-2 rounded-lg text-white hover:bg-white/10 transition-all duration-200 transform hover:scale-105"
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </a>
            <span className="font-semibold text-white text-xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              AI Doubt Solver
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Sidebar dropdown toggle */}
            <div className="relative">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="flex items-center gap-2 p-2 rounded-lg text-white hover:bg-white/10 transition-all duration-200 transform hover:scale-105"
                title="Chat History"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-sm font-medium">Chats</span>
                <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${showSidebar ? 'rotate-90' : '-rotate-90'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Main chat area with scrollable content */}
        {isLoadingMessages ? (
          <div className="flex items-center justify-center flex-1">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            <span className="ml-3 text-gray-300 font-medium">Loading messages...</span>
          </div>
        ) : currentChat.length === 0 ? (
          <div className="empty-screen">
            {/* ChatGPT-style welcome screen */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-8">AI Doubt Solver</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-none mx-auto w-full px-4">
                <div className="p-4 rounded-lg text-center group">
                  <div className="h-14 w-14 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
                    <Stars className="h-7 w-7 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-white">Need help with a concept?</h3>
                  <p className="text-sm text-gray-400 mb-4">Get explanations for complex topics</p>
                  <button
                    onClick={() => setQuery("Explain the concept of quantum entanglement")}
                    className="text-xs text-gray-400 px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors"
                  >
                    "Explain quantum entanglement"
                  </button>
                </div>
                <div className="p-4 rounded-lg text-center group">
                  <div className="h-14 w-14 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
                    <InfoIcon className="h-7 w-7 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-white">Solve a math problem</h3>
                  <p className="text-sm text-gray-400 mb-4">Get step-by-step solutions</p>
                  <button
                    onClick={() => setQuery("Solve the equation: 3x² + 6x - 9 = 0")}
                    className="text-xs text-gray-400 px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors"
                  >
                    "Solve the equation: 3x² + 6x - 9 = 0"
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
              <div
                key={message.id || index}
                className={`chat-row ${message.role}`}
              >
                <div className="flex items-start w-full">
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
                              <img
                                src={message.attachment.url}
                                alt="Uploaded image"
                                className="max-w-full max-h-64 rounded-lg shadow-md"
                              />
                            ) : message.attachment.type === 'application/pdf' ? (
                              <div className="flex items-center gap-2 p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                                <FileText className="w-6 h-6 text-red-600" />
                                <span className="text-sm font-medium">{message.attachment.name}</span>
                              </div>
                            ) : null}
                          </div>
                        )}
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                    )}

                    {message.role === "assistant" && (
                      <div className="mt-2 flex justify-start items-center space-x-2">
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="p-1 text-gray-400 hover:text-gray-200 rounded-md hover:bg-gray-700 copy-button"
                        >
                          {isCopied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {message.role === "user" && (
                    <div className="chat-avatar user">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div
              ref={messagesEndRef}
              style={{ float: 'left', clear: 'both', paddingBottom: '30px', width: '100%', height: '1px' }}
              data-testid="messages-end-ref"
            />
          </div>
        )}

        {/* ChatGPT-style input area */}
        <div className="input-area border-t border-white/20 py-4 px-4">
          <div className="input-container relative max-w-[90%]">
            <form
              onSubmit={handleSubmit}
              className="relative"
            >
              <div className="relative shadow-lg">
                {/* File Preview */}
                {attachmentPreview && (
                  <div className="mb-3 p-3 bg-gray-700 rounded-t-xl">
                    <div className="file-preview-container">
                      {attachmentPreview === 'pdf' ? (
                        <div className="flex items-center gap-3 p-3 bg-red-100 dark:bg-red-900/20 rounded-lg file-preview">
                          <FileText className="w-8 h-8 text-red-600" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{attachment?.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">PDF Document</p>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={attachmentPreview}
                          alt="Preview"
                          className="file-preview object-cover"
                        />
                      )}
                      <div className="file-remove-btn" onClick={removeAttachment}>
                        ×
                      </div>
                    </div>
                  </div>
                )}

                <textarea
                  ref={textareaRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message AI Doubt Solver..."
                  className={`resize-none w-full input-textarea focus:ring-0 focus:outline-none border-0 placeholder:text-gray-400 text-white py-3 pl-4 pr-24 ${attachmentPreview ? 'rounded-b-xl' : 'rounded-xl'}`}
                  rows={attachmentPreview ? 4 : 3}
                />

                <div className="absolute right-3 bottom-2.5 flex items-center space-x-2">
                  <label className="p-1 rounded-md cursor-pointer text-gray-400 hover:text-gray-200">
                    <Image className="w-5 h-5" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      capture="environment"
                      onChange={handleFileChange}
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="send-button"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>


            </form>
          </div>
        </div>

        {/* Scroll to bottom button */}
        <div
          className={`scroll-bottom-button ${showScrollButton ? 'visible' : ''}`}
          onClick={() => scrollToBottom(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    </div>
  );
}

const subjects = [
  {
    name: "Mathematics",
    description: "Algebra, calculus, geometry, statistics and probability",
    icon: <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg"><path d="M4 7l16 0"></path><path d="M4 17l16 0"></path><path d="M4 12l16 0"></path></svg>,
  },
  {
    name: "Physics",
    description: "Mechanics, electromagnetism, thermodynamics, quantum mechanics",
    icon: <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><path d="M21.17 8L12 12"></path><path d="M3.95 6.06L8.54 14"></path><path d="M10.88 21.94L15.46 14"></path></svg>,
  },
  {
    name: "Chemistry",
    description: "Organic chemistry, reactions, molecular structures",
    icon: <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg"><path d="M9 3v18m0-18h6m-6 0H3m6 18H3m6 0h6m0-18v18m0 0h6M15 3h6"></path></svg>,
  },
  {
    name: "Biology",
    description: "Genetics, ecology, anatomy, cellular biology",
    icon: <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg"><path d="M9 7H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4m-6 0V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M9 7h6"></path></svg>,
  },
]; 
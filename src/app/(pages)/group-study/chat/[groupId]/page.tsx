"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import { Send, ArrowLeft, Paperclip, Users, Info, Clock } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: Date;
  attachments?: string[];
}

export default function GroupChatPage() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const groupId = params.groupId as string;
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groupInfo, setGroupInfo] = useState({
    id: "",
    name: "",
    participants: [] as { id: string; name: string; avatar: string }[],
    subject: "",
    nextMeeting: ""
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulate loading group info and messages
  useEffect(() => {
    // This would be replaced with a real API call in production
    setTimeout(() => {
      setGroupInfo({
        id: groupId,
        name: getGroupName(groupId),
        participants: [
          { id: "1", name: "David Kim", avatar: "https://i.pravatar.cc/150?img=3" },
          { id: "2", name: "Emma Johnson", avatar: "https://i.pravatar.cc/150?img=5" },
          { id: "3", name: "Ryan Martinez", avatar: "https://i.pravatar.cc/150?img=8" },
          { id: "4", name: "Aisha Patel", avatar: "https://i.pravatar.cc/150?img=9" },
          { id: "5", name: user?.fullName || "You", avatar: user?.imageUrl || "https://i.pravatar.cc/150?img=1" }
        ],
        subject: getGroupSubject(groupId),
        nextMeeting: getNextMeeting(groupId)
      });

      setMessages(getInitialMessages(groupId));
      setIsLoading(false);
    }, 1000);
  }, [groupId, user]);

  // Helper functions to get sample data based on groupId
  const getGroupName = (id: string): string => {
    const groups: { [key: string]: string } = {
      "group-1": "Organic Chemistry Study Group",
      "group-2": "Calculus II Study Sessions",
      "group-3": "Python Programming Workshop",
      "group-4": "MCAT Study Group"
    };
    return groups[id] || "Study Group";
  };

  const getGroupSubject = (id: string): string => {
    const subjects: { [key: string]: string } = {
      "group-1": "Chemistry",
      "group-2": "Mathematics",
      "group-3": "Computer Science",
      "group-4": "Pre-Med"
    };
    return subjects[id] || "General";
  };

  const getNextMeeting = (id: string): string => {
    const meetings: { [key: string]: string } = {
      "group-1": "July 10, 2024 • 18:00-20:00",
      "group-2": "July 15, 2024 • 19:00-21:00",
      "group-3": "July 8, 2024 • 17:00-19:00",
      "group-4": "July 9, 2024 • 17:30-20:30"
    };
    return meetings[id] || "TBD";
  };

  const getInitialMessages = (id: string): Message[] => {
    // Common messages for all groups
    const commonMessages = [
      {
        id: "msg-1",
        sender: { id: "1", name: "David Kim", avatar: "https://i.pravatar.cc/150?img=3" },
        content: "Hi everyone! Welcome to our study group chat.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
      },
      {
        id: "msg-2",
        sender: { id: "2", name: "Emma Johnson", avatar: "https://i.pravatar.cc/150?img=5" },
        content: "Thanks for setting this up! I'm looking forward to our next session.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 10) // 2 days ago + 10 minutes
      }
    ];

    // Group-specific messages
    const groupMessages: { [key: string]: Message[] } = {
      "group-1": [
        {
          id: "chem-1",
          sender: { id: "1", name: "David Kim", avatar: "https://i.pravatar.cc/150?img=3" },
          content: "For our next session, let's focus on reaction mechanisms. I've attached some practice problems we can work through together.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
          attachments: ["Organic_Chemistry_Practice_Problems.pdf"]
        },
        {
          id: "chem-2",
          sender: { id: "4", name: "Aisha Patel", avatar: "https://i.pravatar.cc/150?img=9" },
          content: "That sounds great! I've been struggling with SN1 and SN2 mechanisms in particular.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) // 4 hours ago
        }
      ],
      "group-2": [
        {
          id: "calc-1",
          sender: { id: "2", name: "Emma Johnson", avatar: "https://i.pravatar.cc/150?img=5" },
          content: "I found a great resource for integration techniques. Check it out!",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10), // 10 hours ago
          attachments: ["Integration_Techniques_Cheatsheet.pdf"]
        },
        {
          id: "calc-2",
          sender: { id: "3", name: "Ryan Martinez", avatar: "https://i.pravatar.cc/150?img=8" },
          content: "Thanks Emma! This is really helpful. Could we go over improper integrals in our next meeting?",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
        }
      ],
      "group-3": [
        {
          id: "py-1",
          sender: { id: "3", name: "Ryan Martinez", avatar: "https://i.pravatar.cc/150?img=8" },
          content: "Here's the code from our last session working with pandas dataframes. I've added some comments to help explain what each part does.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
          attachments: ["pandas_example.py"]
        },
        {
          id: "py-2",
          sender: { id: "1", name: "David Kim", avatar: "https://i.pravatar.cc/150?img=3" },
          content: "For next week, I think we should build a small web app using Flask. What do you all think?",
          timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
        }
      ],
      "group-4": [
        {
          id: "mcat-1",
          sender: { id: "4", name: "Aisha Patel", avatar: "https://i.pravatar.cc/150?img=9" },
          content: "I've created a study schedule for the MCAT that covers all the topics in 8 weeks. Let me know what you think!",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 9), // 9 hours ago
          attachments: ["MCAT_Study_Schedule.xlsx"]
        },
        {
          id: "mcat-2",
          sender: { id: "2", name: "Emma Johnson", avatar: "https://i.pravatar.cc/150?img=5" },
          content: "This looks really comprehensive, Aisha! I'm particularly worried about the Physics section. Can we spend extra time on that?",
          timestamp: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
        }
      ]
    };

    return [...commonMessages, ...(groupMessages[id] || [])].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: {
        id: "user",
        name: user?.fullName || "You",
        avatar: user?.imageUrl || "https://i.pravatar.cc/150?img=1"
      },
      content: messageText,
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setMessageText("");
  };

  // Format timestamp for display
  const formatMessageTime = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffInDays < 7) {
      return `${date.toLocaleDateString([], { weekday: 'short' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-64 w-full max-w-3xl bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={groupInfo.name}
        description={`Chat with your study group members`}
      />

      <div className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main chat area */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex flex-col h-[calc(80vh-100px)]">
              {/* Chat header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link href={`/group-study`} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </Link>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{groupInfo.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{groupInfo.participants.length} members</p>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {groupInfo.participants.slice(0, 3).map((participant) => (
                    <img
                      key={participant.id}
                      src={participant.avatar}
                      alt={participant.name}
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800"
                      title={participant.name}
                    />
                  ))}
                  {groupInfo.participants.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-800 dark:text-gray-200 border-2 border-white dark:border-gray-800">
                      +{groupInfo.participants.length - 3}
                    </div>
                  )}
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-enhanced">
                {messages.map((message, index) => {
                  const isFirstMessageOfDay = index === 0 ||
                    new Date(message.timestamp).toDateString() !== new Date(messages[index - 1].timestamp).toDateString();

                  return (
                    <div key={message.id}>
                      {isFirstMessageOfDay && (
                        <div className="flex justify-center my-4">
                          <div className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full">
                            {new Date(message.timestamp).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      )}
                      <div className={`flex ${message.sender.id === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
                        {message.sender.id !== 'user' && (
                          <img
                            src={message.sender.avatar}
                            alt={message.sender.name}
                            className="w-8 h-8 rounded-full object-cover mt-1"
                          />
                        )}
                        <div className={`max-w-[70%] ${message.sender.id === 'user' ? 'bg-cyan-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'} rounded-2xl px-4 py-2`}>
                          {message.sender.id !== 'user' && (
                            <div className="font-medium text-sm text-cyan-600 dark:text-cyan-400 mb-1">
                              {message.sender.name}
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2">
                              {message.attachments.map((attachment, i) => (
                                <div key={i} className="flex items-center gap-2 p-2 bg-white/20 dark:bg-black/20 rounded mt-1">
                                  <Paperclip className="w-4 h-4" />
                                  <span className="text-sm truncate">{attachment}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className={`text-xs mt-1 ${message.sender.id === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
                            {formatMessageTime(new Date(message.timestamp))}
                          </div>
                        </div>
                        {message.sender.id === 'user' && (
                          <img
                            src={message.sender.avatar}
                            alt={message.sender.name}
                            className="w-8 h-8 rounded-full object-cover mt-1"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    className="flex-grow px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900 dark:text-white"
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="rounded-full p-2 w-10 h-10 flex items-center justify-center"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Group info sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Info className="w-4 h-4" /> Group Information
              </h3>

              <div className="mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Subject</div>
                <div className="font-medium text-gray-900 dark:text-white bg-cyan-50 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-200 rounded-full px-3 py-1 text-sm inline-block">
                  {groupInfo.subject}
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Next Meeting</div>
                <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  {groupInfo.nextMeeting}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Members ({groupInfo.participants.length})
                </div>
                <div className="space-y-3">
                  {groupInfo.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center gap-2">
                      <img
                        src={participant.avatar}
                        alt={participant.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {participant.name}
                        {participant.name === (user?.fullName || "You") && " (You)"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link href="/group-study">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Group
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 
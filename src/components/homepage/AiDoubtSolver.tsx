"use client";

import { useState } from "react";
import { Send, Bot, User, XCircle, ChevronUp, ChevronDown, Sparkles, Loader2 } from "lucide-react";
import { Button } from "../ui/Button";
import { motion, AnimatePresence } from "framer-motion";

const sampleConversation = [
  { role: "assistant", content: "Hi there! I'm your AI study assistant. How can I help you today?" },
  { role: "user", content: "Can you explain the difference between mitosis and meiosis?" },
  { role: "assistant", content: "Certainly! Mitosis and meiosis are both types of cell division, but they serve different purposes:\n\n**Mitosis**:\n- Creates two identical daughter cells with the same number of chromosomes as the parent cell\n- Used for growth, repair, and asexual reproduction\n- One division resulting in two diploid cells\n- Maintains genetic identity\n\n**Meiosis**:\n- Creates four daughter cells with half the number of chromosomes as the parent cell\n- Used exclusively for sexual reproduction\n- Two divisions resulting in four haploid cells\n- Increases genetic diversity through crossing over and random assortment\n\nWould you like me to explain any specific aspect in more detail?" }
];

interface AiDoubtSolverProps {
  expanded?: boolean;
}

const AiDoubtSolver = ({ expanded = false }: AiDoubtSolverProps) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [inputValue, setInputValue] = useState("");
  const [conversation, setConversation] = useState(sampleConversation);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message locally
    const updatedConversation = [...conversation, { role: "user", content: inputValue }];
    setConversation(updatedConversation);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/doubt-solving", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedConversation }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();

      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "Sorry, I couldn't generate a response." },
      ]);
    } catch (error) {
      console.error("AI request failed", error);
      const errorMessage = error instanceof Error
        ? `Error: ${error.message}`
        : "Oops! Something went wrong while generating a response.";

      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: errorMessage },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed bottom-0 right-4 z-40 w-full max-w-md rounded-t-2xl shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${isExpanded ? "h-[70vh]" : "h-14"}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer border-b border-gray-200 dark:border-gray-700 ai-doubt-solver"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900 flex items-center justify-center">
            <Bot className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">AI Study Assistant</h3>
            {!isExpanded && (
              <p className="text-xs text-gray-500 dark:text-gray-400">Ask any study doubt...</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-[calc(70vh-3.5rem)]"
          >
            {/* Conversation area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-enhanced">
              {conversation.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${message.role === "user"
                      ? "bg-cyan-600 text-white ml-4"
                      : "bg-gray-100 dark:bg-gray-700 dark:text-white mr-4"
                      }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.role === "assistant" && (
                        <Bot className="w-5 h-5 mt-0.5 text-cyan-600 dark:text-cyan-400" />
                      )}
                      <div className="whitespace-pre-line text-sm">
                        {message.content}
                      </div>
                      {message.role === "user" && (
                        <User className="w-5 h-5 mt-0.5 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input area */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSubmit} className="flex items-center gap-2" role="form">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask any question about your studies..."
                  className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2 px-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                {inputValue && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setInputValue("")}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <XCircle className="w-5 h-5" />
                  </Button>
                )}
                <Button type="submit" variant="default" size="sm" className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-800 text-white" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AiDoubtSolver; 
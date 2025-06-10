"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, ChevronDown, ChevronUp } from "lucide-react";
import { useCollaborationChat } from "@/hooks/use-collaboration-chat";
import { useAuthQuery } from "@/hooks/use-auth-query";
import toast from "react-hot-toast";

interface ChatPanelProps {
  playbookId: string;
  isExpanded: boolean;
  onToggle: () => void;
  className?: string;
}

export default function ChatPanel({
  playbookId,
  isExpanded,
  onToggle,
  className = "",
}: ChatPanelProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthQuery();

  const { messages, isConnected, sendMessage } = useCollaborationChat({
    playbookId,
    enabled: true,
  });

  // Auto scroll to bottom when new messages arrive and show toast for new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }

    // Show toast for new messages from other users (not system messages or own messages)
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (
        lastMessage.type === "message" &&
        lastMessage.user_id !== user?.id &&
        lastMessage.user_id !== "system"
      ) {
        toast.success(`New message from ${lastMessage.username}`, {
          duration: 3000,
          position: "top-right",
        });
      }
    }
  }, [messages, user?.id]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await sendMessage(newMessage);
    setNewMessage("");
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getMessageColor = (userId: string) => {
    if (userId === "system") return "text-gray-500";
    if (userId === user?.id) return "text-blue-600";

    const colors = [
      "text-green-600",
      "text-purple-600",
      "text-red-600",
      "text-orange-600",
      "text-indigo-600",
      "text-pink-600",
      "text-teal-600",
    ];
    const index = userId
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div className={`bg-white border-t border-gray-200 ${className}`}>
      {/* Chat Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700">Quick Chat</span>
          {messages.length > 0 && (
            <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full font-medium">
              {messages.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </button>

      {/* Chat Messages */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-100"
          >
            {/* Messages Container */}
            <div className="h-64 overflow-y-auto p-3 space-y-2 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-8">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No messages yet</p>
                  <p className="text-xs mt-1">
                    Send a quick message to your collaborators
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${
                      message.type === "system"
                        ? "text-center"
                        : message.user_id === user?.id
                        ? "ml-auto"
                        : ""
                    }`}
                  >
                    {message.type === "system" ? (
                      <div className="text-xs text-gray-500 italic py-1">
                        {message.message}
                      </div>
                    ) : (
                      <div
                        className={`max-w-[80%] ${
                          message.user_id === user?.id
                            ? "ml-auto bg-blue-500 text-white"
                            : "bg-white text-gray-800"
                        } rounded-lg p-2 shadow-sm`}
                      >
                        {message.user_id !== user?.id && (
                          <div className="flex items-center gap-2 mb-1">
                            {message.avatar_url ? (
                              <img
                                src={message.avatar_url}
                                alt={message.username}
                                className="w-4 h-4 rounded-full"
                              />
                            ) : (
                              <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {message.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span
                              className={`text-xs font-medium ${getMessageColor(
                                message.user_id
                              )}`}
                            >
                              {message.username}
                            </span>
                          </div>
                        )}
                        <div className="text-sm break-words">
                          {message.message}
                        </div>
                        <div
                          className={`text-xs mt-1 ${
                            message.user_id === user?.id
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-white border-t border-gray-100"
            >
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a quick message..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={500}
                  disabled={!isConnected}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || !isConnected}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {isConnected
                  ? `${newMessage.length}/500 characters`
                  : "Connecting to chat..."}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

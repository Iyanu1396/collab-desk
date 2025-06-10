"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthQuery } from "@/hooks/use-auth-query";

export interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  message: string;
  timestamp: number;
  type: 'message' | 'system';
}

interface UseCollaborationChatProps {
  playbookId: string;
  enabled?: boolean;
}

export function useCollaborationChat({
  playbookId,
  enabled = true,
}: UseCollaborationChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<ReturnType<typeof createClient>['channel'] | null>(null);
  const { user } = useAuthQuery();
  const supabase = createClient();

  useEffect(() => {
    if (!enabled || !user || !playbookId) return;

    const channel = supabase.channel(`chat-${playbookId}`, {
      config: {
        broadcast: { self: true },
      },
    });

    channelRef.current = channel;

    // Listen for chat messages
    channel
      .on("broadcast", { event: "chat_message" }, (payload) => {
        const message = payload.payload as ChatMessage;
        setMessages((prev) => [...prev, message]);
      })
      .on("broadcast", { event: "user_joined" }, (payload) => {
        const { username } = payload.payload;
        if (username !== user.user_metadata?.username && username !== user.email?.split("@")[0]) {
          const systemMessage: ChatMessage = {
            id: `system_${Date.now()}`,
            user_id: "system",
            username: "System",
            message: `${username} joined the collaboration`,
            timestamp: Date.now(),
            type: "system",
          };
          setMessages((prev) => [...prev, systemMessage]);
        }
      })
      .on("broadcast", { event: "user_left" }, (payload) => {
        const { username } = payload.payload;
        const systemMessage: ChatMessage = {
          id: `system_${Date.now()}`,
          user_id: "system",
          username: "System",
          message: `${username} left the collaboration`,
          timestamp: Date.now(),
          type: "system",
        };
        setMessages((prev) => [...prev, systemMessage]);
      });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setIsConnected(true);
        // Announce user joined
        channel.send({
          type: "broadcast",
          event: "user_joined",
          payload: {
            username: user.user_metadata?.username || user.email?.split("@")[0] || "Anonymous",
          },
        });
      }
    });

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        // Announce user left
        channelRef.current.send({
          type: "broadcast",
          event: "user_left",
          payload: {
            username: user.user_metadata?.username || user.email?.split("@")[0] || "Anonymous",
          },
        });
        channelRef.current.unsubscribe();
      }
    };
  }, [enabled, user, playbookId]);

  const sendMessage = async (message: string) => {
    if (!channelRef.current || !user || !message.trim()) return;

    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}_${user.id}`,
      user_id: user.id,
      username: user.user_metadata?.username || user.email?.split("@")[0] || "Anonymous",
      avatar_url: user.user_metadata?.avatar_url,
      message: message.trim(),
      timestamp: Date.now(),
      type: "message",
    };

    try {
      await channelRef.current.send({
        type: "broadcast",
        event: "chat_message",
        payload: chatMessage,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    isConnected,
    sendMessage,
    clearMessages,
  };
} 
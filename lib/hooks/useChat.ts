"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export interface Message {
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
}

export interface Chat {
  _id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export function useChat(chatId?: string) {
  const router = useRouter();
  const [chats, setChats] = useState<{ _id: string; title: string; updatedAt: string }[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all chats
  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/chat");
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch chats");
      }
      
      const data = await response.json();
      setChats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  

  // Create a new chat
  const createChat = useCallback(async (message: string) => {
    try {
      setLoading(true);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create chat");
      }
      
      const chat = await response.json();
      
      // Update local state
      setChats((prev) => [
        {
          _id: chat._id,
          title: chat.title,
          updatedAt: chat.updatedAt,
        },
        ...prev,
      ]);
      
      setCurrentChat(chat);
      // Navigate immediately so the user sees the chat page right away
      router.push(`/chat/${chat._id}`);
      // Trigger AI response in the background (non-blocking)
      void generateAIResponse(chat._id, message);
      
      return chat._id;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Send a message in an existing chat
  const sendMessage = useCallback(async (id: string, message: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chat/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send message");
      }
      
      const updatedChat = await response.json();
      setCurrentChat(updatedChat);
      
      // Generate AI response using the message just sent
      await generateAIResponse(id, message);
      
      // Refresh chats list to update titles
      fetchChats();
      
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchChats]);

  // Generate AI response
  const generateAIResponse = useCallback(async (id: string, userMessage?: string) => {
    try {
      setMessageLoading(true);
      // Prefer the provided userMessage; fallback to last user message in state
      const latestUserMessage = (userMessage ?? (
        currentChat?.messages
          ?.slice()
          .reverse()
          .find((m) => m.role === "user")?.content
      )) || "";

      const response = await fetch(`/api/chat/${id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: latestUserMessage }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate AI response");
      }
      
      const data = await response.json();
      
      // Update the current chat with the AI response
      setCurrentChat((prev) => {
        if (!prev) return null;
        
        return {
          ...prev,
          messages: [
            ...prev.messages,
            {
              role: "assistant",
              content: data.response,
              createdAt: new Date(),
            },
          ],
        };
      });
      
      return data.response;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setMessageLoading(false);
    }
  }, []);

  // Fetch a specific chat (defined after generateAIResponse to avoid use-before-declare)
  const fetchChat = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chat/${id}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch chat");
      }
      
      const data = await response.json();
      setCurrentChat(data);

      // If the latest message is from the user, auto-generate an AI reply in background
      const last = Array.isArray(data?.messages) && data.messages.length > 0
        ? data.messages[data.messages.length - 1]
        : null;
      if (last && last.role === "user" && typeof last.content === "string" && last.content.trim().length > 0) {
        void generateAIResponse(id, last.content);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [generateAIResponse]);

  // Delete a chat
  const deleteChat = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chat/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete chat");
      }
      
      // Update local state
      setChats((prev) => prev.filter((chat) => chat._id !== id));
      
      // If the current chat is deleted, reset it
      if (currentChat?._id === id) {
        setCurrentChat(null);
      }
      
      // Navigate to the chat page
      router.push("/chat");
      
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentChat, router]);

  // Load initial data
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Load current chat if chatId is provided
  useEffect(() => {
    if (chatId) {
      fetchChat(chatId);
    } else {
      setCurrentChat(null);
    }
  }, [chatId, fetchChat]);

  return {
    chats,
    currentChat,
    loading,
    messageLoading,
    error,
    fetchChats,
    fetchChat,
    createChat,
    sendMessage,
    deleteChat,
  };
}
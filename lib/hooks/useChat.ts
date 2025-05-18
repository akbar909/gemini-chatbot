"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

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

  // Fetch a specific chat
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
      
      // Generate AI response
      await generateAIResponse(chat._id);
      
      // Navigate to the new chat
      router.push(`/chat/${chat._id}`);
      
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
      
      // Generate AI response
      await generateAIResponse(id);
      
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
  const generateAIResponse = useCallback(async (id: string) => {
    try {
      setMessageLoading(true);
      const response = await fetch(`/api/chat/${id}/message`, {
        method: "POST",
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
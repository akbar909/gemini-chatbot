"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { useChat } from "@/lib/hooks/useChat";

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const chatId = params.id;
  const {
    currentChat,
    loading,
    messageLoading,
    sendMessage,
    error,
  } = useChat(chatId);
  const [title, setTitle] = useState("");
  
  useEffect(() => {
    if (currentChat?.title) {
      setTitle(currentChat.title);
      // Update page title
      document.title = `${currentChat.title} - AI Chat`;
    }
    
    return () => {
      document.title = "AI Chat";
    };
  }, [currentChat?.title]);
  
  const handleSendMessage = async (message: string) => {
    if (chatId) {
      await sendMessage(chatId, message);
    }
  };
  
  if (error) {
    return (
      <div className="flex h-screen">
        <ChatSidebar chatId={chatId} />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen">
      <ChatSidebar chatId={chatId} />
      
      <main className="flex-1 flex flex-col">
        <div className="h-14 border-b border-border flex items-center px-4">
          <h1 className="font-medium truncate mx-auto">{title || "Chat"}</h1>
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          <ChatMessages
            messages={currentChat?.messages || []}
            isLoading={loading || messageLoading}
          />
          <ChatInput
            onSend={handleSendMessage}
            isLoading={loading || messageLoading}
          />
        </div>
      </main>
    </div>
  );
}
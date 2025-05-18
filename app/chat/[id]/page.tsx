"use client";

import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { useChat } from "@/lib/hooks/useChat";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
      <main className="flex-1 flex flex-col overflow-y-auto">
        <div className="h-14 border-b border-border flex items-center px-4">
          <h1 className="font-medium truncate mx-auto">{"Chat"}</h1>
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col overflow-x-hidden">
          <ChatMessages
            messages={currentChat?.messages || []}
            isLoading={loading || messageLoading}
          />
        </div>
        <div className="sticky bottom-0 z-10">
          <ChatInput
            onSend={handleSendMessage}
            isLoading={loading || messageLoading}
          />
        </div>
      </main>
    </div>
  );
}
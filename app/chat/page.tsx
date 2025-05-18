"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { useChat } from "@/lib/hooks/useChat";
import { MessageSquarePlus } from "lucide-react";

export default function ChatPage() {
  const router = useRouter();
  const { createChat, loading } = useChat();
  const [initialMessage, setInitialMessage] = useState("");
  
  const handleCreateChat = async () => {
    if (!initialMessage.trim()) return;
    
    const chatId = await createChat(initialMessage);
    
    if (chatId) {
      router.push(`/chat/${chatId}`);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCreateChat();
    }
  };
  
  return (
    <div className="flex h-screen">
      <ChatSidebar />
      
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-3xl mx-auto w-full">
          <div className="text-center mb-8">
            <div className="mb-4 flex justify-center">
              <div className="p-4 rounded-full bg-primary/10">
                <MessageSquarePlus className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Start a new chat</h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Ask about anything - from code explanations to creative writing, from facts to friendly conversation.
            </p>
          </div>
          
          <div className="w-full space-y-4">
            <textarea
              className="w-full p-4 bg-muted/50 border border-border rounded-lg resize-none min-h-[150px] focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="What would you like to know or discuss?"
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            
            <Button
              className="w-full"
              size="lg"
              onClick={handleCreateChat}
              disabled={!initialMessage.trim() || loading}
            >
              {loading ? "Starting chat..." : "Start Chat"}
            </Button>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div className="p-6 border border-border rounded-lg">
              <h3 className="font-medium mb-2">Examples</h3>
              <p className="text-sm text-muted-foreground mb-3">
                &quot;Explain quantum computing in simple terms&quot;
              </p>
              <p className="text-sm text-muted-foreground">
                &quot;Write a short poem about programming&quot;
              </p>
            </div>
            
            <div className="p-6 border border-border rounded-lg">
              <h3 className="font-medium mb-2">Capabilities</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Remembers conversation history within each chat
              </p>
              <p className="text-sm text-muted-foreground">
                Can provide code with syntax highlighting
              </p>
            </div>
            
            <div className="p-6 border border-border rounded-lg">
              <h3 className="font-medium mb-2">Limitations</h3>
              <p className="text-sm text-muted-foreground mb-3">
                May produce incorrect or incomplete information
              </p>
              <p className="text-sm text-muted-foreground">
                Knowledge is limited to its training data
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
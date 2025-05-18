"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizonal } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  isLoading,
  placeholder = "Type your message...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    
    const messageCopy = message;
    setMessage("");
    await onSend(messageCopy);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    // Focus the textarea when the component mounts
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div className="p-4 border-t border-border">
      <div className="relative max-w-4xl mx-auto flex items-end">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[60px] max-h-[200px]  resize-none pr-14  border-muted"
          disabled={isLoading}
        />
        <Button
          size="icon"
          className="absolute right-2 bottom-2 h-9 w-9 rounded-full"
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
        >
          <SendHorizonal className="h-5 w-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
      <div className="text-xs text-center text-muted-foreground mt-2">
        Press Enter to send, Shift+Enter for a new line
      </div>
    </div>
  );
}
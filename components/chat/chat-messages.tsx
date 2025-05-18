"use client";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Check } from "lucide-react";
import { Message } from "@/lib/hooks/useChat";
import { formatRelativeTime } from "@/lib/utils";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!messages.length && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <path d="M13 8h.01" />
            <path d="M17 8h.01" />
            <path d="M9 8h.01" />
          </svg>
        </div>
        <h3 className="text-lg font-medium">Start a new conversation</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-2">
          Ask a question, request code examples, or start a conversation about any topic.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-0 space-y-6 max-w-full text-wrap break-words">
      {messages.map((message, index) => {
        const isUser = message.role === "user";

        return (
          <motion.div
            key={index}
            className="flex gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className={isUser ? "bg-primary/10" : "bg-purple-500/20"}>
                {isUser ? "U" : "AI"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{isUser ? "You" : "AI Assistant"}</span>
                {message.createdAt && (
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(message.createdAt)}
                  </span>
                )}
              </div>

              <div
                className={`prose prose-sm max-w-full break-words text-wrap
                  ${isUser ? "prose-p:mb-2 prose-p:leading-normal" : "prose-p:mb-3 prose-code:text-primary-foreground"}
                `}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeHighlight]}
                  components={{
                    pre({ node, children, ...props }) {
                      return (
                        <div className="relative group mb-4 w-72 sm:w-full text-wrap overflow-x-auto">
                          <pre
                            className="rounded-lg bg-card p-3 border border-border text-sm font-mono  break-words overflow-x-auto max-w-full text-wrap"
                            {...props}
                          >

                            {children}
                          </pre>
                          {(() => {
                            const firstChild = React.Children.toArray(children)[0];
                            const codeContent =
                              React.isValidElement(firstChild) &&
                                typeof firstChild.props.children === "string"
                                ? firstChild.props.children
                                : "";
                            return <CopyButton content={codeContent} />;
                          })()}
                        </div>
                      );
                    },
                    p({ children }) {
                      return <p className="mb-4 last:mb-0 break-words text-wrap max-w-full text-justify">{children}</p>

                    },
                    a({ href, children }) {
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline underline-offset-4"
                        >
                          {children}
                        </a>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          </motion.div>
        );
      })}

      {isLoading && (
        <div className="flex gap-4">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-purple-500/20">AI</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[80%]" />
              <Skeleton className="h-4 w-[90%]" />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

interface CopyButtonProps {
  content: string;
}

function CopyButton({ content }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute right-2 top-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy code"}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      <span className="sr-only">{copied ? "Copied" : "Copy code"}</span>
    </Button>
  );
}

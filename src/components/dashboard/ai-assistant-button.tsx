"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, X, Send, Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function AIAssistantButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI security assistant. I can help you understand your audit findings, provide remediation guidance, and answer questions about AWS security best practices.",
      timestamp: new Date(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "What are my critical findings?",
    "How do I fix IAM issues?",
    "Summarize my security posture",
    "Explain S3 bucket policies",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: message.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            accountName: "Production",
            totalFindings: 127,
            critical: 12,
            high: 34,
            medium: 45,
            low: 36,
            score: 78,
          },
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.content,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I encountered an error. Please try again or check your connection.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    return `${hour12.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300",
          isOpen
            ? "bg-white/10 hover:bg-white/20 rotate-0"
            : "btn-gradient animate-pulse-glow hover:scale-110"
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Sparkles className="w-6 h-6" />
        )}
      </Button>

      {/* Chat Panel */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 w-[400px] transition-all duration-300 transform origin-bottom-right",
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        )}
      >
        <div className="glass-card overflow-hidden flex flex-col h-[500px]">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Security Assistant</h3>
              <p className="text-xs text-white/50">Powered by Claude</p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto scrollbar-hide space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" && "flex-row-reverse"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    msg.role === "assistant" ? "bg-primary/10" : "bg-white/10"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <Sparkles className="w-4 h-4 text-primary" />
                  ) : (
                    <User className="w-4 h-4 text-white/60" />
                  )}
                </div>
                <div
                  className={cn(
                    "flex-1",
                    msg.role === "user" && "flex flex-col items-end"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-lg p-3 max-w-[280px]",
                      msg.role === "assistant"
                        ? "bg-white/5 rounded-tl-none"
                        : "bg-primary/20 rounded-tr-none"
                    )}
                  >
                    <p className="text-sm text-white/80 whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                  <span className="text-xs text-white/30 mt-1 block">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-white/5 rounded-lg rounded-tl-none p-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" />
                    <span
                      className="w-2 h-2 bg-white/40 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <span
                      className="w-2 h-2 bg-white/40 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Quick Prompts - only show if few messages */}
            {messages.length <= 1 && (
              <div className="mt-4">
                <p className="text-xs text-white/40 mb-2">Quick prompts:</p>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => setMessage(prompt)}
                      className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 rounded-full text-white/60 hover:text-white transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Ask about your security findings..."
                className="flex-1 h-10 px-4 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className="h-10 w-10 btn-gradient"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-white/30 mt-2 text-center">
              AI responses are for guidance only. Always verify recommendations.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

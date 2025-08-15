"use client";

import { useEffect, useRef } from "react";
import { Bot, User, FileText, ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MessageTranslator } from "./message-translator";
import { ChatMessage } from "@/types/agriculture";
import { supportedLanguages } from "@/data/languages";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  onTranslateActionMessageAction: (
    messageId: string,
    targetLanguage: string,
  ) => void;
}

export function ChatMessages({
  messages,
  isLoading,
  onTranslateActionMessageAction,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSpeak = (text: string, languageCode: string) => {
    const language = supportedLanguages.find((l) => l.code === languageCode);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language?.voiceCode || "en-US";
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-4xl px-4 py-6">
        {messages.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-6">🌾</div>
            <h1 className="text-3xl font-bold mb-4 text-green-700">
              Welcome to PRAGATI
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Your intelligent farming companion powered by AI. Get expert
              advice on crops, weather, market prices, and sustainable farming
              practices.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                {
                  icon: "🌱",
                  title: "Crop Planning",
                  desc: "Get personalized crop recommendations",
                },
                {
                  icon: "🌤️",
                  title: "Weather Insights",
                  desc: "Weather-based farming advice",
                },
                {
                  icon: "💰",
                  title: "Market Analysis",
                  desc: "Real-time crop prices and trends",
                },
                {
                  icon: "🔬",
                  title: "Health Diagnostics",
                  desc: "Disease detection and treatment",
                },
              ].map((item, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 border-green-200 hover:border-green-300"
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl mb-3">{item.icon}</div>
                    <h3 className="font-semibold mb-2 text-green-700">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8 bg-green-100 shrink-0">
                  <AvatarFallback className="bg-transparent">
                    <Bot className="h-4 w-4 text-green-600" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={`max-w-[85%] ${message.role === "user" ? "order-first" : ""}`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted prose prose-sm max-w-none"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </div>
                  )}

                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center gap-2 text-sm opacity-90"
                        >
                          {attachment.type === "image" ? (
                            <ImageIcon className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                          <span>{attachment.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {message.translations &&
                    Object.keys(message.translations).length > 0 && (
                      <div className="mt-3 space-y-2 border-t border-border/20 pt-3">
                        {Object.entries(message.translations).map(
                          ([langCode, translation]) => {
                            const language = supportedLanguages.find(
                              (l) => l.code === langCode,
                            );
                            if (!language) return null;

                            return (
                              <div
                                key={langCode}
                                className="text-sm opacity-90"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs">
                                    {language.flag}
                                  </span>
                                  <span className="text-xs font-medium">
                                    {language.nativeName}:
                                  </span>
                                </div>
                                <div className="pl-6">{translation}</div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    )}
                </div>

                <div
                  className={`flex items-center justify-between mt-2 ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`text-xs text-muted-foreground ${
                      message.role === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>

                  <MessageTranslator
                    message={message}
                    onTranslateAction={onTranslateActionMessageAction}
                    onSpeakAction={handleSpeak}
                  />
                </div>
              </div>

              {message.role === "user" && (
                <Avatar className="h-8 w-8 bg-blue-100 shrink-0">
                  <AvatarFallback className="bg-transparent">
                    <User className="h-4 w-4 text-blue-600" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 justify-start">
              <Avatar className="h-8 w-8 bg-green-100">
                <AvatarFallback className="bg-transparent">
                  <Bot className="h-4 w-4 text-green-600" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-current rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-current rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

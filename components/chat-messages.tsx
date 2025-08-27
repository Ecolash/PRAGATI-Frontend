/* eslint-disable prettier/prettier */
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  User,
  FileText,
  ImageIcon,
  ChevronUp,
  ChevronDown,
  Info,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MessageTranslator } from "./message-translator";
import { ChatMessage } from "@/types/agriculture";
import { supportedLanguages } from "@/data/languages";
import { formatTimestamp } from "@/lib/date-utils";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import { Marquee } from "./ui/marquee";
import { agricultureAgents } from "@/data/agents";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  onTranslateActionMessageAction: (
    messageId: string,
    targetLanguage: string
  ) => void;
  onSelectAgentAction?: (agentId: string) => void; // ✅ new prop
}

const categoryColors: Record<string, string> = {
  prediction: "bg-pink-100 text-pink-700",
  advisory: "bg-sky-100 text-sky-700",
  analysis: "bg-purple-100 text-purple-700",
  market: "bg-amber-100 text-amber-700",
  news: "bg-slate-100 text-slate-700",
  research: "bg-indigo-100 text-indigo-700",
};

export function ChatMessages({
  messages,
  isLoading,
  onTranslateActionMessageAction,
  onSelectAgentAction,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showEmbeddingNotice, setShowEmbeddingNotice] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isLoading) {
      timer = setTimeout(() => setShowEmbeddingNotice(true), 15000); // 215s delay
    } else {
      setShowEmbeddingNotice(false);
      setShowDetails(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading]);

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
              Your intelligent farming companion powered by AI. Select an AI
              specialist below to get started.
            </p>

            <div className="px-4">
              <Marquee pauseOnHover className="py-4">
                {agricultureAgents.map((agent) => (
                  <Card
                    key={agent.id}
                    onClick={() => onSelectAgentAction?.(agent.id)}
                    className="cursor-pointer w-52 h-60 flex flex-col hover:shadow-lg transition-all duration-200 hover:scale-[1.03] border-green-200 hover:border-green-300 mx-2 rounded-2xl"
                  >
                    <CardContent className="p-5 flex flex-col items-center text-center h-full">
                      {/* Icon */}
                      <div className={`mb-3 ${agent.color}`}>{agent.icon}</div>

                      {/* Name */}
                      <h3 className="font-semibold text-base text-gray-900 mb-2">
                        {agent.name}
                      </h3>

                      {/* Category fixed line */}
                      <div className="h-6 flex items-center justify-center mb-2">
                        <span
                          className={`text-xs px-3 py-0.5 rounded-full ${
                            categoryColors[agent.category] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {agent.category.charAt(0).toUpperCase() +
                            agent.category.slice(1)}
                        </span>
                      </div>

                      {/* Push description to bottom */}
                      <div className="mt-auto">
                        <p className="text-sm text-gray-600 leading-snug line-clamp-3">
                          {agent.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </Marquee>
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
                    <div className="markdown-body">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </div>
                  )}

                  {/* Chart display for workflow agent responses */}
                  {message.role === "assistant" &&
                    message.metadata?.chart_path && (
                      <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-blue-700">
                              Generated Chart
                            </span>
                          </div>
                          {/* Download button for ImageKit URLs */}
                          {message.metadata.chart_path?.includes(
                            "imagekit.io"
                          ) && (
                            <a
                              href={message.metadata.chart_path}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                              Download
                            </a>
                          )}
                        </div>
                        <div className="bg-white p-3 rounded-md border relative">
                          <img
                            src={
                              message.metadata.chart_path?.includes(
                                "imagekit.io"
                              )
                                ? `${message.metadata.chart_path}?tr=w-800,h-400,c-at_max,q-90,f-auto`
                                : message.metadata.chart_path
                            }
                            alt="Generated chart"
                            className="w-full h-auto max-w-full rounded border"
                            style={{ maxHeight: "400px", objectFit: "contain" }}
                            loading="lazy"
                            onError={(e) => {
                              console.error(
                                "Failed to load chart image:",
                                message.metadata?.chart_path
                              );
                              const errorDiv = document.createElement("div");
                              errorDiv.className =
                                "flex items-center justify-center h-32 bg-gray-100 text-gray-500 text-sm rounded border";
                              errorDiv.innerHTML =
                                "📊 Chart temporarily unavailable";
                              e.currentTarget.parentNode?.replaceChild(
                                errorDiv,
                                e.currentTarget
                              );
                            }}
                          />
                        </div>
                        {message.metadata.chart_extra_message && (
                          <div className="mt-3 text-sm text-blue-600 bg-blue-50 p-3 rounded border border-blue-200">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeHighlight]}
                            >
                              {message.metadata.chart_extra_message}
                            </ReactMarkdown>
                          </div>
                        )}
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
                              (l) => l.code === langCode
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
                          }
                        )}
                      </div>
                    )}
                </div>

                {/* Workflow agent metadata display */}
                {message.role === "assistant" &&
                  message.metadata?.agent_type === "deep-research" &&
                  (message.metadata.final_mode ||
                    message.metadata.switched_modes ||
                    message.metadata.is_answer_complete !== undefined) && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 bg-slate-500 rounded-full"></div>
                        <span className="text-xs font-medium text-slate-700">
                          Response Analysis
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                        {message.metadata.final_mode && (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">Mode:</span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                message.metadata.final_mode === "rag"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {message.metadata.final_mode?.toUpperCase()}
                            </span>
                          </div>
                        )}
                        {message.metadata.switched_modes !== undefined && (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">
                              Mode Switched:
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                message.metadata.switched_modes
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {message.metadata.switched_modes ? "Yes" : "No"}
                            </span>
                          </div>
                        )}
                        {message.metadata.is_answer_complete !== undefined && (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">Complete:</span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                message.metadata.is_answer_complete
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {message.metadata.is_answer_complete
                                ? "Yes"
                                : "No"}
                            </span>
                          </div>
                        )}
                        {message.metadata.processing_time && (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">Time:</span>
                            <span className="text-slate-700 font-mono">
                              {message.metadata.processing_time.toFixed(2)}s
                            </span>
                          </div>
                        )}
                        {message.metadata.is_image_query !== undefined && (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">Image Query:</span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                message.metadata.is_image_query
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {message.metadata.is_image_query ? "Yes" : "No"}
                            </span>
                          </div>
                        )}
                        {message.metadata.answer_quality_grade && (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">Quality:</span>
                            <span className="text-slate-700 font-mono text-xs">
                              {typeof message.metadata.answer_quality_grade ===
                              "object"
                                ? JSON.stringify(
                                    message.metadata.answer_quality_grade
                                  ).slice(0, 20) + "..."
                                : message.metadata.answer_quality_grade}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

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
                    {formatTimestamp(message.timestamp)}
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
                {showEmbeddingNotice && (
                  <div className="mt-3 text-xs sm:text-sm text-gray-700">
                    {/* Compact notice */}
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2 rounded-xl shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Info className="h-4 w-4 text-green-600 animate-pulse" />
                          <span className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-30"></span>
                        </div>
                        <span className="font-medium animate-pulse bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                          Generating embeddings…
                        </span>
                      </div>

                      {/* Expand/Collapse button */}
                      <button
                        onClick={() => setShowDetails((prev) => !prev)}
                        className="ml-2 text-green-600 hover:text-green-700 transition"
                      >
                        {showDetails ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Detailed view - single paragraph */}
                    {showDetails && (
                      <div className="mt-3 p-4 bg-white border border-gray-200 rounded-xl shadow-lg text-sm text-gray-600 leading-relaxed">
                        <p>
                          The system is generating{" "}
                          <span className="font-medium">vector embeddings</span>{" "}
                          of the knowledge base. This step takes longer only the{" "}
                          <span className="font-medium">first time</span>, but
                          once cached, future queries will be answered{" "}
                          <span className="text-green-600 font-semibold">
                            instantly
                          </span>
                          .
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

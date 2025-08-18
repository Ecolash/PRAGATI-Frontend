"use client";

import type React from "react";

import { useState, useRef, type KeyboardEvent, useEffect } from "react";
import {
  Send,
  Paperclip,
  X,
  FileText,
  ImageIcon,
  Square,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnimatedVoiceInput } from "./animated-voice-input";
import { LanguageSelector } from "./language-selector";
import type { Language } from "@/types/agriculture";

interface CleanChatInputProps {
  onSendMessageAction: (message: string, files?: File[]) => void;
  onLanguageChangeAction: (language: Language) => void;
  selectedLanguage: string;
  disabled?: boolean;
  placeholder?: string;
  switchMode?: boolean;
  onToolsEnabledChange?: (enabled: boolean) => void;
}

export function ChatInput({
  onSendMessageAction,
  onLanguageChangeAction,
  selectedLanguage,
  disabled = false,
  placeholder = "Message PRAGATI...",
  switchMode = false,
  onToolsEnabledChange,
}: CleanChatInputProps) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [toolsEnabled, setToolsEnabled] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim() || files.length > 0) {
      onSendMessageAction(message.trim(), files);
      setMessage("");
      setFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceInput = (text: string) => {
    setMessage((prev) => prev + (prev ? " " : "") + text);
    adjustTextareaHeight();
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const validFiles = selectedFiles.filter(
      (file) =>
        file.type.startsWith("image/") || file.type === "application/pdf",
    );
    setFiles((prev) => [...prev, ...validFiles].slice(0, 3));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  // Notify parent when toolsEnabled changes
  useEffect(() => {
    onToolsEnabledChange?.(toolsEnabled);
  }, [toolsEnabled, onToolsEnabledChange]);

  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-4xl p-3 sm:p-4">
        {files.length > 0 && (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            <div className="flex gap-2 min-w-0">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm shrink-0 min-w-0 max-w-[200px] sm:max-w-[250px]"
                >
                  {file.type.startsWith("image/") ? (
                    <ImageIcon className="h-4 w-4 text-blue-500 shrink-0" />
                  ) : (
                    <FileText className="h-4 w-4 text-red-500 shrink-0" />
                  )}
                  <span
                    className="font-medium truncate min-w-0"
                    title={file.name}
                  >
                    {file.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-5 w-5 p-0 hover:bg-red-100 hover:text-red-600 shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <TooltipProvider>
          <div className="relative rounded-xl border border-gray-300 bg-white focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex flex-col">
              {/* Text input area */}
              <div className="p-3 pb-2">
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  disabled={disabled}
                  className="w-full min-h-[40px] max-h-[120px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm leading-relaxed"
                  rows={1}
                />
              </div>

              <div className="border-t border-gray-100 bg-gray-50/50 rounded-b-xl px-3 py-2">
                <div className="flex items-center justify-between">
                  {/* Left controls group */}
                  <div className="flex items-center gap-1">
                    {!switchMode && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={disabled || files.length >= 3}
                            className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm text-gray-600 hover:text-gray-800 shrink-0 transition-all duration-200"
                          >
                            <Paperclip className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <span className="whitespace-nowrap">
                            Attach files ({files.length}/3)
                          </span>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    <AnimatedVoiceInput
                      onVoiceInputAction={handleVoiceInput}
                      onSpeakActionToggleAction={() => {}}
                      selectedLanguage={selectedLanguage}
                      compact
                    />

                    <LanguageSelector
                      selectedLanguage={selectedLanguage}
                      onLanguageChangeAction={onLanguageChangeAction}
                      compact
                    />

                    {switchMode && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            onClick={() => setToolsEnabled((prev) => !prev)}
                            size="sm"
                            className={`h-8 w-8 p-0 rounded-md border transition-all duration-200 shrink-0 ${
                              toolsEnabled
                                ? "border-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-100 shadow-sm"
                                : "border-gray-300 text-gray-500 bg-white hover:bg-gray-50 hover:shadow-sm"
                            }`}
                          >
                            <Wrench className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <span className="whitespace-nowrap">
                            {toolsEnabled ? "Disable Tools" : "Enable Tools"}
                          </span>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  {/* Send button */}
                  <Button
                    onClick={handleSend}
                    disabled={
                      disabled || (!message.trim() && files.length === 0)
                    }
                    size="sm"
                    className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 shrink-0 min-w-[80px] transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <span className="flex items-center gap-2">
                      {disabled ? (
                        <Square className="h-4 w-4" />
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span className="text-xs font-medium">Send</span>
                        </>
                      )}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TooltipProvider>

        <div className="mt-2 text-xs text-gray-500 text-center px-2">
          <span className="break-words">
            PRAGATI can make mistakes. Please verify important information.
          </span>
        </div>
      </div>
    </div>
  );
}

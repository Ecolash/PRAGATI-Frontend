/* eslint-disable prettier/prettier */
"use client";

import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { Send, Paperclip, X, FileText, Image, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnimatedVoiceInput } from "./animated-voice-input";
import { LanguageSelector } from "./language-selector";
import { Language } from "@/types/agriculture";

interface CleanChatInputProps {
  onSendMessageAction: (message: string, files?: File[]) => void;
  onLanguageChangeAction: (language: Language) => void;
  selectedLanguage: string;
  disabled?: boolean;
  placeholder?: string;
  presetMessage?: string;
}

export function ChatInput({
  onSendMessageAction,
  onLanguageChangeAction,
  selectedLanguage,
  disabled = false,
  placeholder = "Message PRAGATI...",
  presetMessage,
}: CleanChatInputProps) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (presetMessage && presetMessage !== message) {
      setMessage(presetMessage);
    }
  }, [presetMessage]);

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
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120,
      )}px`;
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

  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-4xl p-4 sm:p-3">
        {/* File attachments */}
        {files.length > 0 && (
          <div className="mb-3 flex flex-nowrap overflow-x-auto gap-2 scrollbar-thin">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm shrink-0"
              >
                {file.type.startsWith("image/") ? (
                  <Image className="h-4 w-4 text-blue-500" />
                ) : (
                  <FileText className="h-4 w-4 text-red-500" />
                )}
                <span className="font-medium truncate max-w-[100px]">
                  {file.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-5 w-5 p-0 hover:bg-red-100 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Input + controls */}
        <div className="relative rounded-xl border border-gray-300 bg-white focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Mobile layout: Stacked */}
          <div className="flex flex-col sm:hidden">
            {/* Text input */}
            <div className="p-3 pb-2">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full min-h-[40px] max-h-[120px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                rows={1}
              />
            </div>

            {/* Mobile controls row */}
            <div className="flex items-center justify-between px-3 pb-3 pt-1">
              {/* Left side controls */}
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={disabled || files.length >= 3}
                      className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-500"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Attach files ({files.length}/3)
                  </TooltipContent>
                </Tooltip>

                <AnimatedVoiceInput
                  onVoiceInputAction={handleVoiceInput}
                  onSpeakActionToggleAction={() => { }}
                  selectedLanguage={selectedLanguage}
                  compact
                />

                <LanguageSelector
                  selectedLanguage={selectedLanguage}
                  onLanguageChangeAction={onLanguageChangeAction}
                  compact
                />
              </div>

              {/* Send button */}
              <Button
                onClick={handleSend}
                disabled={disabled || (!message.trim() && files.length === 0)}
                size="sm"
                className="h-8 w-20 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300"
              >
                {disabled ? (
                  <Square className="h-4 w-4" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Desktop/tablet layout: Side by side */}
          <div className="hidden sm:flex items-end gap-2 p-3">
            {/* Text input */}
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full min-h-[40px] max-h-[120px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                rows={1}
              />
            </div>

            {/* Desktop controls */}
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || files.length >= 3}
                    className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-500"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Attach files ({files.length}/3)</TooltipContent>
              </Tooltip>

              <AnimatedVoiceInput
                onVoiceInputAction={handleVoiceInput}
                onSpeakActionToggleAction={() => { }}
                selectedLanguage={selectedLanguage}
                compact
              />

              <LanguageSelector
                selectedLanguage={selectedLanguage}
                onLanguageChangeAction={onLanguageChangeAction}
                compact
              />

              <Button
                onClick={handleSend}
                disabled={disabled || (!message.trim() && files.length === 0)}
                size="sm"
                className="h-8 w-8 p-0 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 ml-1"
              >
                {disabled ? (
                  <Square className="h-4 w-4" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-2 text-xs text-gray-500 text-center">
          PRAGATI can make mistakes. Please verify important information.
        </div>
      </div>
    </div>
  );
}

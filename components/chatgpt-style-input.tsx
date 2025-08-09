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
import { VoiceControls } from "./enhanced-voice-controls";
import { LanguageSelector } from "./enhanced-language-selector";
import { Language } from "@/types/agriculture";

interface ChatGPTStyleInputProps {
  onSendMessageAction: (message: string, files?: File[]) => void;
  onLanguageChangeAction: (language: Language) => void;
  selectedLanguage: string;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatGPTStyleInput({
  onSendMessageAction,
  onLanguageChangeAction,
  selectedLanguage,
  disabled = false,
  placeholder = "Message AgriAI...",
}: ChatGPTStyleInputProps) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
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

  const handleSpeakToggle = (enabled: boolean) => {
    // Handle voice output toggle
    console.log("Voice output:", enabled);
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const validFiles = selectedFiles.filter(
      (file) =>
        file.type.startsWith("image/") || file.type === "application/pdf",
    );
    setFiles((prev) => [...prev, ...validFiles].slice(0, 5));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(
      (file) =>
        file.type.startsWith("image/") || file.type === "application/pdf",
    );
    setFiles((prev) => [...prev, ...validFiles].slice(0, 5));
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  return (
    <div className="border-t bg-background">
      <div className="mx-auto max-w-4xl p-4">
        {/* File attachments display */}
        {files.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-sm"
              >
                {file.type.startsWith("image/") ? (
                  <Image className="h-4 w-4 text-blue-600" />
                ) : (
                  <FileText className="h-4 w-4 text-red-600" />
                )}
                <div className="flex flex-col">
                  <span className="font-medium truncate max-w-[150px]">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Main input area */}
        <div
          className={`relative rounded-2xl border bg-background transition-colors ${
            isDragOver ? "border-green-500 bg-green-50" : "border-green-200"
          } ${disabled ? "opacity-50" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex items-end gap-2 p-3">
            {/* Attach button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || files.length >= 5}
                  className="shrink-0 h-8 w-8 p-0 hover:bg-green-50 text-green-600"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Attach files (images, PDFs) - {files.length}/5
              </TooltipContent>
            </Tooltip>

            {/* Text input */}
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className="min-h-[40px] max-h-[200px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                rows={1}
              />
            </div>

            {/* Voice and language controls */}
            <div className="flex items-center gap-1 shrink-0">
              <VoiceControls
                onVoiceInputAction={handleVoiceInput}
                onSpeakActionToggleAction={handleSpeakToggle}
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleSend}
                  disabled={disabled || (!message.trim() && files.length === 0)}
                  size="sm"
                  className="shrink-0 h-8 w-8 p-0 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
                >
                  {disabled ? (
                    <Square className="h-4 w-4" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {disabled ? "Stop generation" : "Send message"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Footer text */}
        <div className="mt-2 text-xs text-muted-foreground text-center">
          AgriAI can make mistakes. Please verify important agricultural
          information.
        </div>
      </div>
    </div>
  );
}

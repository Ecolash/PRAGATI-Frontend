"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supportedLanguages } from "@/data/languages";

interface VoiceControlsProps {
  onVoiceInputAction: (text: string) => void;
  onSpeakActionToggleAction: (enabled: boolean) => void;
  selectedLanguage: string;
  compact?: boolean;
}

export function VoiceControls({
  onVoiceInputAction,
  onSpeakActionToggleAction,
  selectedLanguage,
  compact = false,
}: VoiceControlsProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeakEnabled, setIsSpeakEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const currentLanguage = supportedLanguages.find(
    (lang) => lang.code === selectedLanguage,
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const startListening = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = currentLanguage?.voiceCode || "en-US";

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setIsProcessing(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsProcessing(false);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsProcessing(true);
        onVoiceInputAction(transcript);
        setTimeout(() => setIsProcessing(false), 500);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        setIsProcessing(false);
      };

      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleSpeak = () => {
    const newState = !isSpeakEnabled;
    setIsSpeakEnabled(newState);
    onSpeakActionToggleAction(newState);
  };

  const speakText = (text: string) => {
    if (synthRef.current && isSpeakEnabled) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLanguage?.voiceCode || "en-US";
      utterance.rate = 0.9;
      utterance.pitch = 1;
      synthRef.current.speak(utterance);
    }
  };

  // Expose speakText function for parent components
  useEffect(() => {
    (window as any).speakText = speakText;
  }, [isSpeakEnabled, currentLanguage]);

  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={compact ? "sm" : "default"}
            onClick={isListening ? stopListening : startListening}
            className={`${isListening ? "text-red-500 bg-red-50" : ""} ${isProcessing ? "animate-pulse" : ""}`}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <div>{isListening ? "Stop listening" : "Start voice input"}</div>
            <div className="text-xs text-muted-foreground">
              Language: {currentLanguage?.nativeName}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={compact ? "sm" : "default"}
            onClick={toggleSpeak}
            className={!isSpeakEnabled ? "text-gray-400" : ""}
          >
            {isSpeakEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isSpeakEnabled ? "Disable voice output" : "Enable voice output"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

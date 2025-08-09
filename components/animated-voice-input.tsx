"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supportedLanguages } from "@/data/languages";

interface AnimatedVoiceInputProps {
  onVoiceInputAction: (text: string) => void;
  onSpeakActionToggleAction: (enabled: boolean) => void;
  selectedLanguage: string;
  compact?: boolean;
}

export function AnimatedVoiceInput({
  onVoiceInputAction,
  onSpeakActionToggleAction,
  selectedLanguage,
  compact = false,
}: AnimatedVoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeakEnabled, setIsSpeakEnabled] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const currentLanguage = supportedLanguages.find(
    (lang) => lang.code === selectedLanguage,
  );

  const startAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current =
        audioContextRef.current.createMediaStreamSource(stream);

      analyserRef.current.fftSize = 256;
      microphoneRef.current.connect(analyserRef.current);

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const updateAudioLevel = () => {
        if (analyserRef.current && isListening) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255);
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };

      updateAudioLevel();
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopAudioAnalysis = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().then();
    }
    setAudioLevel(0);
  };

  const startListening = async () => {
    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    recognitionRef.current = new SpeechRecognitionCtor();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = currentLanguage?.voiceCode || "en-US";

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setIsProcessing(false);
      startAudioAnalysis();
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      setIsProcessing(false);
      stopAudioAnalysis();
    };

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setIsProcessing(true);
      onVoiceInputAction(transcript);
      setTimeout(() => setIsProcessing(false), 1000);
    };

    recognitionRef.current.onerror = () => {
      setIsListening(false);
      setIsProcessing(false);
      stopAudioAnalysis();
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    stopAudioAnalysis();
  };

  const toggleSpeak = () => {
    const newState = !isSpeakEnabled;
    setIsSpeakEnabled(newState);
    onSpeakActionToggleAction(newState);
  };

  useEffect(() => {
    return () => {
      stopAudioAnalysis();
    };
  }, []);

  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={compact ? "sm" : "default"}
            onClick={isListening ? stopListening : startListening}
            className={`relative ${
              isListening
                ? "text-red-500 bg-red-50"
                : "text-gray-600 hover:bg-gray-50"
            } ${isProcessing ? "animate-pulse" : ""}`}
            disabled={isProcessing}
          >
            {isListening && (
              <>
                <div
                  className="absolute inset-0 rounded-full bg-red-500 opacity-20 animate-ping"
                  style={{
                    transform: `scale(${1 + audioLevel * 0.5})`,
                    transition: "transform 0.1s ease-out",
                  }}
                />
                <div
                  className="absolute inset-0 rounded-full bg-red-500 opacity-10"
                  style={{
                    transform: `scale(${1 + audioLevel})`,
                    transition: "transform 0.1s ease-out",
                  }}
                />
              </>
            )}

            {isListening ? (
              <MicOff className="h-4 w-4 relative z-10" />
            ) : (
              <Mic className="h-4 w-4 relative z-10" />
            )}

            {isListening && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                <div
                  className="w-6 h-1 bg-red-500 rounded-full transition-all duration-100"
                  style={{
                    transform: `scaleX(${audioLevel})`,
                    opacity: audioLevel > 0.1 ? 1 : 0.3,
                  }}
                />
              </div>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <div>{isListening ? "Stop listening" : "Start voice input"}</div>
            <div className="text-xs text-muted-foreground">
              Language: {currentLanguage?.nativeName}
            </div>
            {isListening && (
              <div className="text-xs text-red-500 mt-1">
                Listening... Speak now
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={compact ? "sm" : "default"}
            onClick={toggleSpeak}
            className={`${
              !isSpeakEnabled
                ? "text-gray-400"
                : "text-gray-600 hover:bg-gray-50"
            }`}
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

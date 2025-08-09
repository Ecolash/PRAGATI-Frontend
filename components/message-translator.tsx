"use client";

import { useState } from "react";
import { Languages, Volume2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { supportedLanguages } from "@/data/languages";
import { ChatMessage } from "@/types/agriculture";

interface MessageTranslatorProps {
  message: ChatMessage;
  onTranslateAction: (messageId: string, targetLanguage: string) => void;
  onSpeakAction: (text: string, language: string) => void;
}

export function MessageTranslator({
  message,
  onTranslateAction,
  onSpeakAction,
}: MessageTranslatorProps) {
  const [copiedTranslation, setCopiedTranslation] = useState<string | null>(
    null,
  );
  const [selectedLanguageForVoice, setSelectedLanguageForVoice] =
    useState<string>("en");

  const handleTranslate = (languageCode: string) => {
    onTranslateAction(message.id, languageCode);
  };

  const handleSpeak = () => {
    const textToSpeak =
      message.translations?.[selectedLanguageForVoice] || message.content;
    onSpeakAction(textToSpeak, selectedLanguageForVoice);
  };

  const handleCopy = async (text: string, languageCode: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedTranslation(languageCode);
    setTimeout(() => setCopiedTranslation(null), 2000);
  };

  if (message.role === "user") return null;

  return (
    <div className="flex items-center gap-2 mt-2">
      {/* Translate Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs hover:bg-green-50 text-green-700"
          >
            <Languages className="h-3 w-3 mr-1" />
            Translate
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {supportedLanguages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleTranslate(language.code)}
              className="flex items-center gap-2 cursor-pointer hover:bg-green-50"
            >
              <span>{language.flag}</span>
              <span className="text-sm">{language.nativeName}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Single Voice Button with Language Selection */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs hover:bg-green-50 text-green-700"
          >
            <Volume2 className="h-3 w-3 mr-1" />
            Speak
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem
            onClick={() => {
              setSelectedLanguageForVoice("en");
              handleSpeak();
            }}
            className="flex items-center gap-2 cursor-pointer hover:bg-green-50"
          >
            <span>🇺🇸</span>
            <span className="text-sm">Original (English)</span>
          </DropdownMenuItem>

          {message.translations &&
            Object.keys(message.translations).length > 0 && (
              <>
                <DropdownMenuSeparator />
                {Object.entries(message.translations).map(
                  ([langCode, translation]) => {
                    const language = supportedLanguages.find(
                      (l) => l.code === langCode,
                    );
                    if (!language) return null;

                    return (
                      <DropdownMenuItem
                        key={langCode}
                        onClick={() => {
                          setSelectedLanguageForVoice(langCode);
                          onSpeakAction(translation, langCode);
                        }}
                        className="flex items-center gap-2 cursor-pointer hover:bg-green-50"
                      >
                        <span>{language.flag}</span>
                        <span className="text-sm">{language.nativeName}</span>
                      </DropdownMenuItem>
                    );
                  },
                )}
              </>
            )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Copy Button for Translations */}
      {message.translations && Object.keys(message.translations).length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs hover:bg-green-50 text-green-700"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem
              onClick={() => handleCopy(message.content, "original")}
              className="flex items-center gap-2 cursor-pointer hover:bg-green-50"
            >
              {copiedTranslation === "original" ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              <span className="text-sm">Original Text</span>
            </DropdownMenuItem>

            {Object.entries(message.translations).map(
              ([langCode, translation]) => {
                const language = supportedLanguages.find(
                  (l) => l.code === langCode,
                );
                if (!language) return null;

                return (
                  <DropdownMenuItem
                    key={langCode}
                    onClick={() => handleCopy(translation, langCode)}
                    className="flex items-center gap-2 cursor-pointer hover:bg-green-50"
                  >
                    {copiedTranslation === langCode ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    <span className="text-sm">{language.nativeName}</span>
                  </DropdownMenuItem>
                );
              },
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

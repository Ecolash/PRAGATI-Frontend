"use client";

import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supportedLanguages } from "@/data/languages";
import { Language } from "@/types/agriculture";

interface SimpleLanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChangeAction: (language: Language) => void;
  compact?: boolean;
}

export function LanguageSelector({
  selectedLanguage,
  onLanguageChangeAction,
  compact = false,
}: SimpleLanguageSelectorProps) {
  const currentLang =
    supportedLanguages.find((lang) => lang.code === selectedLanguage) ||
    supportedLanguages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? "sm" : "default"}
          className="gap-2 hover:bg-gray-50 text-gray-600"
        >
          <Globe className="h-4 w-4" />
          {!compact && (
            <>
              <span>{currentLang.flag}</span>
              <span className="hidden sm:inline text-sm">
                {currentLang.nativeName}
              </span>
            </>
          )}
          {compact && <span>{currentLang.flag}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {supportedLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => onLanguageChangeAction(language)}
            className="flex items-center justify-between gap-2 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span>{language.flag}</span>
              <span className="text-sm">{language.nativeName}</span>
            </div>
            {selectedLanguage === language.code && (
              <Check className="h-4 w-4 text-emerald-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

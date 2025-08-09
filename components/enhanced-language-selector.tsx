"use client";

import { Languages, Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { supportedLanguages } from "@/data/languages";
import { Language } from "@/types/agriculture";

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChangeAction: (language: Language) => void;
  compact?: boolean;
}

export function LanguageSelector({
  selectedLanguage,
  onLanguageChangeAction,
  compact = false,
}: LanguageSelectorProps) {
  const currentLang =
    supportedLanguages.find((lang) => lang.code === selectedLanguage) ||
    supportedLanguages[0];

  const indianLanguages = supportedLanguages.filter(
    (lang) => lang.code !== "en",
  );
  const englishLanguage = supportedLanguages.find(
    (lang) => lang.code === "en",
  )!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? "sm" : "default"}
          className="gap-2 hover:bg-muted/50 transition-colors"
        >
          <Globe className="h-4 w-4" />
          {!compact && (
            <>
              <span className="font-medium">{currentLang.flag}</span>
              <span className="hidden sm:inline font-medium">
                {currentLang.nativeName}
              </span>
              <Badge variant="secondary" className="text-xs">
                {currentLang.code.toUpperCase()}
              </Badge>
            </>
          )}
          {compact && <span className="font-medium">{currentLang.flag}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          Select Language
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => onLanguageChangeAction(englishLanguage)}
          className="flex items-center justify-between gap-2 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">{englishLanguage.flag}</span>
            <div>
              <div className="font-medium">{englishLanguage.name}</div>
              <div className="text-xs text-muted-foreground">
                {englishLanguage.nativeName}
              </div>
            </div>
          </div>
          {selectedLanguage === englishLanguage.code && (
            <Check className="h-4 w-4 text-primary" />
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Indian Languages
        </DropdownMenuLabel>

        {indianLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => onLanguageChangeAction(language)}
            className="flex items-center justify-between gap-2 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{language.flag}</span>
              <div>
                <div className="font-medium">{language.name}</div>
                <div className="text-xs text-muted-foreground">
                  {language.nativeName}
                </div>
              </div>
            </div>
            {selectedLanguage === language.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

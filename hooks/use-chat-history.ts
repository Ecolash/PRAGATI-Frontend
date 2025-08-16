import { useState, useCallback } from "react";
import { ChatSession } from "@/types/agriculture";

export interface ChatHistoryHook {
  saveChatSession: (session: ChatSession) => Promise<void>;
  loadChatHistory: () => Promise<ChatSession[]>;
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useChatHistory(): ChatHistoryHook {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveChatSession = useCallback(async (session: ChatSession) => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/chat-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: session.id,
          title: session.title,
          agentId: session.agent?.id,
          agentName: session.agent?.name,
          language: session.language,
          messages: session.messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save chat session");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to save chat session");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save chat session";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const loadChatHistory = useCallback(async (): Promise<ChatSession[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat-history", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load chat history");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to load chat history");
      }

      return result.chatSessions || [];
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load chat history";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    saveChatSession,
    loadChatHistory,
    isSaving,
    isLoading,
    error,
  };
}

"use client";

import { useState, useCallback, useEffect } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "./app-sidebar";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { ChatSession, ChatMessage, Language } from "@/types/agriculture";
import { agricultureAgents } from "@/data/agents";
import { agriculturalAPI } from "@/lib/agricultural-api";
import { useChatHistory } from "@/hooks/use-chat-history";
import { CropRecommendation } from "@/components/crop-recommendation";
import { FertilizerRecommendation } from "@/components/fertilizer-recommendation";
import { IrrigationCalendar } from "@/components/irrigation-calendar";
import { CropDiseaseDetection } from "@/components/crop-disease-prediction";
import { PestPrediction } from "@/components/pest-prediction";
import { Switch } from "./ui/switch";
import { Bot, Wrench } from "lucide-react";
import { WeatherForecast } from "@/components/weather-forecast";
import { CropYieldPredictor } from "@/components/crop-yield-predictor";
import { AgriculturalNewsFeed } from "@/components/agricultural-news-feed";

export default function AgriculturalAIChatbot() {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [agentMode, setAgentMode] = useState(false);

  const { saveChatSession, loadChatHistory, isSaving } = useChatHistory();

  const currentSession = chatSessions.find(
    (session) => session.id === currentSessionId,
  );

  console.log("Current Session ID:", currentSessionId);
  console.log("Current Session Agent:", currentSession?.agent?.id);

  // Load chat history on component mount
  useEffect(() => {
    const initializeChatHistory = async () => {
      try {
        console.log("Loading chat history...");
        const history = await loadChatHistory();
        console.log("Loaded chat sessions:", history.length);

        if (history.length > 0) {
          setChatSessions(history);
          // Set the most recent session as current
          // setCurrentSessionId(history[0].id);
        } else {
          // Create initial session if no history exists
          createNewChat();
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
        // Create a new chat session on error
        createNewChat();
      } finally {
        setIsLoadingHistory(false);
      }
    };

    initializeChatHistory();
  }, []);

  // Auto-save chat sessions when they change
  useEffect(() => {
    if (isLoadingHistory || chatSessions.length === 0) return;

    const saveCurrentSession = async () => {
      if (currentSessionId) {
        const sessionToSave = chatSessions.find(
          (s) => s.id === currentSessionId,
        );
        if (sessionToSave && sessionToSave.messages.length > 0) {
          try {
            await saveChatSession(sessionToSave);
            console.log("Session auto-saved:", sessionToSave.id);
          } catch (error) {
            console.error("Failed to auto-save session:", error);
          }
        }
      }
    };

    // Debounce the save operation
    const timeout = setTimeout(saveCurrentSession, 2000);
    return () => clearTimeout(timeout);
  }, [chatSessions, currentSessionId, isLoadingHistory, saveChatSession]);

  const createNewChat = useCallback(() => {
    if (isLoadingHistory) return; // Don't create new chat while loading

    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      language: selectedLanguage,
      agent: undefined,
    };
    setChatSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setAgentMode(false);
  }, [selectedLanguage, isLoadingHistory]);

  const selectSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
  }, []);

  const selectAgent = useCallback(
    (agentId: string) => {
      console.log("Selecting agent:", agentId);
      setAgentMode(false); // Reset to tool mode when selecting a new agent
      const agent = agricultureAgents.find((a) => a.id === agentId);
      if (agent) {
        if (agent.mode === "agent") setAgentMode(true);
        else if (agent.mode === "tool") setAgentMode(false);
        const newSession: ChatSession = {
          id: Date.now().toString(),
          title: agent.name,
          messages: [
            {
              id: Date.now().toString(),
              role: "assistant",
              content: `Hello! I'm your ${agent.name} specialist. ${agent.description}. How can I help you today?`,
              timestamp: new Date(),
              language: selectedLanguage,
            },
          ],
          agent,
          createdAt: new Date(),
          updatedAt: new Date(),
          language: selectedLanguage,
        };
        setChatSessions((prev) => [newSession, ...prev]);
        setCurrentSessionId(newSession.id);
      }
    },
    [selectedLanguage],
  );

  const handleLanguageChange = useCallback((language: Language) => {
    setSelectedLanguage(language.code);
  }, []);

  const translateMessage = useCallback(
    async (messageId: string, targetLanguage: string) => {
      // console.log("=== TRANSLATION DEBUG ===");
      // console.log("Message ID:", messageId);
      // console.log("Target Language:", targetLanguage);
      // console.log("Current Session ID:", currentSessionId);

      const session = chatSessions.find((s) => s.id === currentSessionId);
      const message = session?.messages.find((msg) => msg.id === messageId);

      // console.log("Found Session:", !!session);
      // console.log("Found Message:", !!message);
      // console.log(
      //   "Message Content:",
      //   message?.content?.substring(0, 50) + "..."
      // );
      // console.log("========================");

      if (!message) return;

      try {
        //console.log("Calling translation API...");
        const translationResult = await agriculturalAPI.translateText(
          message.content,
          targetLanguage,
        );
        //console.log("Translation Result:", translationResult);

        setChatSessions((prev) =>
          prev.map((session) =>
            session.id === currentSessionId
              ? {
                  ...session,
                  messages: session.messages.map((msg) =>
                    msg.id === messageId
                      ? {
                          ...msg,
                          translations: {
                            ...msg.translations,
                            [targetLanguage]: translationResult.translated_text,
                          },
                        }
                      : msg,
                  ),
                }
              : session,
          ),
        );
        //console.log("Translation stored successfully");
      } catch (error: any) {
        console.error("Translation failed:", error);
        // Fallback to mock translation
        setChatSessions((prev) =>
          prev.map((session) =>
            session.id === currentSessionId
              ? {
                  ...session,
                  messages: session.messages.map((msg) =>
                    msg.id === messageId
                      ? {
                          ...msg,
                          translations: {
                            ...msg.translations,
                            [targetLanguage]: `[Translation unavailable] ${msg.content}`,
                          },
                        }
                      : msg,
                  ),
                }
              : session,
          ),
        );
      }
    },
    [currentSessionId, chatSessions],
  );

  const sendMessage = useCallback(
    async (content: string, files?: File[]) => {
      if (!currentSessionId) {
        createNewChat();
        return;
      }

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
        language: selectedLanguage,
        attachments: files?.map((file) => ({
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: file.type.startsWith("image/") ? "image" : "pdf",
          url: URL.createObjectURL(file),
          size: file.size,
        })),
      };

      setChatSessions((prev) =>
        prev.map((session) =>
          session.id === currentSessionId
            ? {
                ...session,
                messages: [...session.messages, userMessage],
                title:
                  session.messages.length === 0
                    ? content.slice(0, 40) + "..."
                    : session.title,
                updatedAt: new Date(),
              }
            : session,
        ),
      );

      setIsLoading(true);

      try {
        // Prepare context for the API call
        const previousMessages =
          currentSession?.messages.slice(-5).map((msg) => ({
            role: msg.role,
            content: msg.content,
          })) || [];

        const apiResponse = await agriculturalAPI.sendQuery({
          query: content,
          language: selectedLanguage,
          context: {
            agent_type: currentSession?.agent?.id,
            previous_messages: previousMessages,
          },
        });

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: apiResponse.response,
          timestamp: new Date(),
          language: selectedLanguage,
          metadata: {
            confidence: apiResponse.confidence,
            sources: apiResponse.sources,
            agent_type: apiResponse.agent_type,
          },
        };

        setChatSessions((prev) =>
          prev.map((session) =>
            session.id === currentSessionId
              ? {
                  ...session,
                  messages: [...session.messages, assistantMessage],
                  updatedAt: new Date(),
                }
              : session,
          ),
        );
      } catch (error) {
        console.error("Failed to get AI response:", error);

        // Fallback message if API fails
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "I'm sorry, I'm having trouble connecting to the agricultural AI service right now. Please try again later.",
          timestamp: new Date(),
          language: selectedLanguage,
          error: true,
        };

        setChatSessions((prev) =>
          prev.map((session) =>
            session.id === currentSessionId
              ? {
                  ...session,
                  messages: [...session.messages, errorMessage],
                  updatedAt: new Date(),
                }
              : session,
          ),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [currentSessionId, createNewChat, selectedLanguage],
  );

  const getAgentPresetMessage = (agentId?: string) => {
    if (!agentId) return "";
    const presets: Record<string, string> = {
      "crop-yield": "What crop yield information are you looking for?",
      "fertilizer-recommendations": "What fertilizer details do you need?",
      "weather-advisory": "What weather information do you need?",
      "crop-recommendations":
        "What type of crop recommendations are you seeking?",
      "irrigation-planning": "What type of irrigation are you planning?",
      "crop-health": "Describe the crop health issue you're observing",
      "pest-prediction": "What pest information do you need?",
      "market-prices": "What market price information are you looking for?",
    };
    return presets[agentId] || "";
  };

  // Minimal placeholder for specialised agents
  const renderAgentInterface = () => {
    if (!currentSession?.agent) return null;
    const agentId = currentSession.agent.id;
    if (!agentId) return null;

    // Show chat interface if in agent mode
    if (agentMode) {
      return (
        <div className="flex flex-col flex-1 min-h-0">
          <ChatMessages
            messages={currentSession?.messages || []}
            isLoading={isLoading}
            onTranslateActionMessageAction={translateMessage}
          />
          <ChatInput
            onSendMessageAction={sendMessage}
            onLanguageChangeAction={handleLanguageChange}
            selectedLanguage={selectedLanguage}
            disabled={isLoading}
            placeholder={getAgentPresetMessage(currentSession.agent.id)}
            presetMessage={getAgentPresetMessage(currentSession.agent.id)}
          />
        </div>
      );
    }

    // Otherwise show the tool interface
    switch (currentSession.agent.id) {
      case "crop-yield":
        return <CropYieldPredictor />;
      case "fertilizer-recommendations":
        return <FertilizerRecommendation />;
      case "weather-advisory":
        return <WeatherForecast />;
      case "crop-recommendations":
        return <CropRecommendation />;
      case "irrigation-planning":
        return <IrrigationCalendar />;
      case "crop-health":
        return <CropDiseaseDetection />;
      case "pest-prediction":
        return <PestPrediction />;
      case "price-forecasting":
      case "market-prices":
        return null;
      case "agriculture-news":
        return <AgriculturalNewsFeed />;
      default:
        return null;
    }
  };

  // Show loading state while loading history
  if (isLoadingHistory) {
    return (
      <div className="flex h-screen w-full bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat history...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-50">
        <AppSidebar
          chatSessions={chatSessions}
          currentSessionId={currentSessionId}
          onNewChatAction={createNewChat}
          onSelectSessionAction={selectSession}
          onSelectAgentAction={selectAgent}
        />
        <SidebarInset className="flex flex-col">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-gray-200 px-4 bg-white">
            <SidebarTrigger className="-ml-1 text-gray-600 hover:bg-gray-100" />
            <Separator
              orientation="vertical"
              className="mr-2 h-4 bg-gray-300"
            />
            <div className="flex items-center gap-2">
              {isSaving && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <div className="h-3 w-3 animate-spin rounded-full border border-emerald-500 border-t-transparent"></div>
                  Saving...
                </div>
              )}
              {currentSession?.agent ? (
                <>
                  <div className={`${currentSession.agent.color}`}>
                    {currentSession.agent.icon}
                  </div>
                  <h1 className="font-semibold text-gray-900">
                    {currentSession.agent.name}
                  </h1>
                </>
              ) : (
                <>
                  <div className="h-5 w-5 rounded bg-emerald-100 flex items-center justify-center">
                    <span className="text-xs">🌾</span>
                  </div>
                  <h1 className="font-semibold text-gray-900">
                    PRAGATI Assistant
                  </h1>
                </>
              )}
            </div>
            {currentSession?.agent && currentSession.agent.mode === "both" && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="hidden sm:inline text-sm text-gray-600">
                  Tool
                </span>
                <Wrench className="sm:hidden w-4 h-4 text-gray-600" />
                <Switch
                  checked={agentMode}
                  onCheckedChange={setAgentMode}
                  className="data-[state=checked]:bg-emerald-600"
                />
                <span className="hidden sm:inline text-sm text-gray-600">
                  Agent
                </span>
                <Bot className="sm:hidden w-4 h-4 text-gray-600" />
              </div>
            )}
          </header>
          <div className="flex flex-col flex-1 min-h-0">
            {renderAgentInterface() || (
              <>
                <ChatMessages
                  messages={currentSession?.messages || []}
                  isLoading={isLoading}
                  onTranslateActionMessageAction={translateMessage}
                  onSelectAgentAction={selectAgent}
                />
                <ChatInput
                  onSendMessageAction={sendMessage}
                  onLanguageChangeAction={handleLanguageChange}
                  selectedLanguage={selectedLanguage}
                  disabled={isLoading}
                  placeholder={
                    currentSession?.agent
                      ? `Ask about ${currentSession.agent.name.toLowerCase()}...`
                      : "Message PRAGATI..."
                  }
                />
              </>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

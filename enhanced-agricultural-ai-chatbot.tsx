"use client";

import { useState, useCallback } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AppSidebar } from "./components/enhanced-app-sidebar";
import { ChatMessages } from "./components/enhanced-chat-messages";
import { ChatGPTStyleInput } from "./components/chatgpt-style-input";
import { ChatSession, ChatMessage, Language } from "./types/agriculture";
import { agricultureAgents } from "./data/agents";
import { supportedLanguages } from "./data/languages";

export default function AgriculturalAIChatbot() {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const currentSession = chatSessions.find(
    (session) => session.id === currentSessionId,
  );

  const createNewChat = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      language: selectedLanguage,
    };
    setChatSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  }, [selectedLanguage]);

  const selectSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
  }, []);

  const selectAgent = useCallback(
    (agentId: string) => {
      const agent = agricultureAgents.find((a) => a.id === agentId);
      if (agent) {
        const welcomeMessages = {
          "crop-yield":
            "Hello! I'm your Crop Yield Prediction specialist. I can help you forecast yields based on soil conditions, weather patterns, historical data, and farming practices. What crop would you like to analyze?",
          "weather-advisory":
            "Greetings! I'm your Weather & Climate Advisory expert. I provide weather-based farming recommendations, seasonal planning advice, and climate adaptation strategies. How can I help with your weather-related farming decisions?",
          "crop-recommendations":
            "Hi there! I'm your Crop/Seed Recommendation specialist. I analyze soil test results, climate conditions, and market factors to suggest the best crops for your land. Do you have soil test results to share?",
          "crop-health":
            "Welcome! I'm your Crop Health Analysis expert. I can identify diseases, pests, and nutritional deficiencies from images and symptoms. Upload a photo or describe what you're seeing in your crops.",
          "market-prices":
            "Hello! I'm your Market Price specialist. I provide real-time crop prices, market trends, and trading insights. Which crops are you interested in tracking?",
          "fertilizer-recommendations":
            "Hi! I'm your Fertilizer Recommendation expert. I create customized fertilization plans based on soil tests, crop requirements, and growth stages. What crops are you growing?",
          "pest-prediction":
            "Greetings! I'm your Pest Prediction specialist. I help identify, predict, and prevent pest infestations using weather data and crop monitoring. What pest concerns do you have?",
          "irrigation-predictions":
            "Hello! I'm your Irrigation specialist. I optimize water usage, scheduling, and irrigation methods based on soil moisture, weather, and crop needs. Tell me about your irrigation setup.",
          "price-forecasting":
            "Hi there! I'm your Market Price Forecasting expert. I analyze market trends, supply-demand factors, and economic indicators to predict future crop prices. Which markets interest you?",
          "agriculture-news":
            "Welcome! I'm your Agriculture News specialist. I provide the latest farming news, policy updates, technology advances, and market developments. What agricultural topics interest you most?",
        };

        const newSession: ChatSession = {
          id: Date.now().toString(),
          title: agent.name,
          messages: [
            {
              id: Date.now().toString(),
              role: "assistant",
              content:
                welcomeMessages[agentId as keyof typeof welcomeMessages] ||
                `Hello! I'm your ${agent.name} specialist. ${agent.description}. How can I help you today?`,
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

  const handleLanguageChange = useCallback(
    (language: Language) => {
      setSelectedLanguage(language.code);
      // Update current session language if exists
      if (currentSessionId) {
        setChatSessions((prev) =>
          prev.map((session) =>
            session.id === currentSessionId
              ? { ...session, language: language.code }
              : session,
          ),
        );
      }
    },
    [currentSessionId],
  );

  const translateMessage = useCallback(
    async (messageId: string, targetLanguage: string) => {
      // Simulate translation API call
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
                          [targetLanguage]: `[Translated to ${supportedLanguages.find((l) => l.code === targetLanguage)?.nativeName}] ${msg.content}`,
                        },
                      }
                    : msg,
                ),
              }
            : session,
        ),
      );
    },
    [currentSessionId],
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
                    ? content.slice(0, 50) + (content.length > 50 ? "..." : "")
                    : session.title,
                updatedAt: new Date(),
              }
            : session,
        ),
      );

      setIsLoading(true);

      // Simulate AI response with agent-specific content
      setTimeout(() => {
        const currentAgent = currentSession?.agent;
        let responseContent = `Thank you for your question about "${content}". `;

        if (currentAgent) {
          const agentResponses = {
            "crop-yield":
              "Based on the information provided, I can analyze various factors affecting crop yield including soil nutrients, weather patterns, seed variety, and farming practices. For accurate predictions, I would need details about your specific crop, location, soil conditions, and current farming methods.",
            "weather-advisory":
              "Current weather conditions and forecasts suggest specific farming activities. I recommend monitoring temperature, rainfall, and humidity levels for optimal crop management. Would you like me to provide specific recommendations for your location and crops?",
            "crop-recommendations":
              "Based on typical soil and climate conditions, I can suggest suitable crops. For personalized recommendations, please share your soil test results including pH, nutrient levels, and organic matter content.",
            "crop-health":
              "I can help diagnose crop health issues. If you've uploaded images, I'll analyze them for signs of disease, pest damage, or nutrient deficiencies. Please describe any symptoms you've observed.",
            "market-prices":
              "Current market prices vary by region and crop quality. I can provide price trends and market analysis. Which specific crops and markets are you interested in?",
            "fertilizer-recommendations":
              "Fertilizer recommendations depend on soil test results, crop type, and growth stage. I can create a customized fertilization plan once you provide more details about your crops and soil conditions.",
            "pest-prediction":
              "Pest activity depends on weather conditions, crop stage, and regional factors. I can help identify current risks and suggest preventive measures. What crops are you growing and what pest signs have you noticed?",
            "irrigation-predictions":
              "Irrigation needs vary based on soil type, crop stage, weather conditions, and water availability. I can help optimize your irrigation schedule. Tell me about your current irrigation system and crop requirements.",
            "price-forecasting":
              "Market price forecasts consider supply-demand dynamics, weather impacts, global trade, and economic factors. I can provide trend analysis for specific crops and timeframes.",
            "agriculture-news":
              "Here are the latest developments in agriculture relevant to your interests. I can provide updates on policy changes, new technologies, market developments, and research findings.",
          };

          responseContent +=
            agentResponses[currentAgent.id as keyof typeof agentResponses] ||
            "I'm here to provide specialized assistance in this area.";
        } else {
          responseContent += `As your agricultural AI assistant, I can help with farming insights, crop recommendations, weather analysis, market prices, and more.${files?.length ? ` I've noted your uploaded files and can analyze them for relevant agricultural insights.` : ""}`;
        }

        responseContent +=
          "\n\nHow else can I assist you with your farming needs?";

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: responseContent,
          timestamp: new Date(),
          language: selectedLanguage,
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
        setIsLoading(false);
      }, 1500);
    },
    [currentSessionId, createNewChat, selectedLanguage, currentSession],
  );

  // Create initial session if none exists
  if (chatSessions.length === 0 && !currentSessionId) {
    createNewChat();
  }

  const currentLanguageObj =
    supportedLanguages.find((lang) => lang.code === selectedLanguage) ||
    supportedLanguages[0];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar
          chatSessions={chatSessions}
          currentSessionId={currentSessionId}
          onNewChatAction={createNewChat}
          onSelectSessionAction={selectSession}
          onSelectAgentAction={selectAgent}
        />
        <SidebarInset className="flex flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-green-200 px-4 bg-white">
            <SidebarTrigger className="-ml-1 text-green-600 hover:bg-green-50" />
            <Separator
              orientation="vertical"
              className="mr-2 h-4 bg-green-200"
            />
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                {currentSession?.agent ? (
                  <>
                    <div className="text-green-600">
                      {currentSession.agent.icon}
                    </div>
                    <h1 className="font-semibold text-lg text-green-700">
                      {currentSession.agent.name}
                    </h1>
                  </>
                ) : (
                  <>
                    <div className="h-6 w-6 rounded bg-green-100 flex items-center justify-center">
                      <span className="text-sm">🌾</span>
                    </div>
                    <h1 className="font-semibold text-lg text-green-700">
                      AgriAI Assistant
                    </h1>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <Badge
                  variant="secondary"
                  className="gap-1 bg-green-100 text-green-700 border-green-200"
                >
                  <span>{currentLanguageObj.flag}</span>
                  <span className="text-xs">
                    {currentLanguageObj.nativeName}
                  </span>
                </Badge>
                {currentSession?.messages.length && (
                  <Badge
                    variant="outline"
                    className="text-xs border-green-200 text-green-700"
                  >
                    {currentSession.messages.length} messages
                  </Badge>
                )}
              </div>
            </div>
          </header>

          <div className="flex flex-col flex-1 min-h-0">
            <ChatMessages
              messages={currentSession?.messages || []}
              isLoading={isLoading}
              onTranslateActionMessageAction={translateMessage}
            />
            <ChatGPTStyleInput
              onSendMessageAction={sendMessage}
              onLanguageChangeAction={handleLanguageChange}
              selectedLanguage={selectedLanguage}
              disabled={isLoading}
              placeholder={
                currentSession?.agent
                  ? `Ask me about ${currentSession.agent.name.toLowerCase()}...`
                  : "Message AgriAI..."
              }
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

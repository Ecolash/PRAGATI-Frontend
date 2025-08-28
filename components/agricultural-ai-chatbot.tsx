/* eslint-disable prettier/prettier */
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  Bot,
  Wrench,
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import { WeatherForecast } from "@/components/weather-forecast";
import { CropYieldPredictor } from "@/components/crop-yield-predictor";
import { AgriculturalNewsFeed } from "@/components/agricultural-news-feed";
import { APIHealthCheck } from "@/components/api-health-check";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import { buildPromptWithUserContext } from "@/lib/utils";
import { getUser } from "@/lib/actions/getUser";
import { Turnstile } from "@marsidev/react-turnstile";
import { PersonalizationPage } from "@/components/personalised-section";

type UserType = {
  id: string;
  fullName: string;
  username: string;
  aadharNumber: string;
};

export default function AgriculturalAIChatbot() {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [agentMode, setAgentMode] = useState(false);
  const [toolsEnabled, setToolsEnabled] = useState(true);
  const [turnstileToken, setTurnstileToken] = useState("");

  const { saveChatSession, loadChatHistory, isSaving } = useChatHistory();
  const [user, setUser] = useState<UserType | null>(null);

  // Use ref to avoid stale closure issues
  const toolsEnabledRef = useRef(toolsEnabled);

  // Update ref when toolsEnabled changes
  useEffect(() => {
    toolsEnabledRef.current = toolsEnabled;
  }, [toolsEnabled]);

  // Memoized callback to handle tools enabled changes
  const handleToolsEnabledChange = useCallback((enabled: boolean) => {
    setToolsEnabled(enabled);
  }, []);

  const currentSession = chatSessions.find(
    (session) => session.id === currentSessionId
  );

  console.log("Current Session ID:", currentSessionId);
  console.log("Current Session Agent:", currentSession?.agent?.id);

  // Load chat history on component mount
  useEffect(() => {
    getUser().then((data) => {
      setUser(data.user);
    });
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
          (s) => s.id === currentSessionId
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
    const timeout = setTimeout(saveCurrentSession, 10000);
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
    [selectedLanguage]
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
          targetLanguage
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
                      : msg
                  ),
                }
              : session
          )
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
                      : msg
                  ),
                }
              : session
          )
        );
      }
    },
    [currentSessionId, chatSessions]
  );

  const sendMessage = useCallback(
    async (content: string, files?: File[]) => {
      // Check if we have a valid Turnstile token
      if (!turnstileToken) {
        alert("Please complete the security verification to send a message.");
        return;
      }

      let sessionId = currentSessionId;

      if (!sessionId) {
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
        sessionId = newSession.id; // ✅ use the new session
      }

      // now always proceed to send the message
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
          session.id === sessionId
            ? {
                ...session,
                messages: [...session.messages, userMessage],
                title:
                  session.messages.length === 0
                    ? content.slice(0, 40) + "..."
                    : session.title,
                updatedAt: new Date(),
              }
            : session
        )
      );

      setIsLoading(true);

      try {
        let assistantMessage: ChatMessage;

        // Check if we're in agent mode and have a specific agent
        if (agentMode && currentSession?.agent?.id === "crop-recommendations") {
          // Use specialized crop recommendation agent endpoint
          console.log("Using crop recommendation agent");
          const prompt = await buildPromptWithUserContext(
            content,
            user?.fullName || "Farmer"
          );
          const agentResponse =
            await agriculturalAPI.getCropRecommendationAgent({
              prompt: prompt,
            });

          // Format the response nicely
          let formattedResponse =
            "Based on your query, here are my crop recommendations:\n\n";

          agentResponse.crop_names.forEach((crop, index) => {
            const confidence = agentResponse.confidence_scores[index];
            const justification = agentResponse.justifications[index];
            formattedResponse += `🌾 **${crop}** (${(confidence * 100).toFixed(1)}% confidence)\n`;
            formattedResponse += `   ${justification}\n\n`;
          });

          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: formattedResponse,
            timestamp: new Date(),
            language: selectedLanguage,
            metadata: {
              agent_type: "crop-recommendations",
              crop_names: agentResponse.crop_names,
              confidence_scores: agentResponse.confidence_scores,
              justifications: agentResponse.justifications,
            },
          };
        } else if (
          agentMode &&
          currentSession?.agent?.id === "weather-advisory"
        ) {
          // Use specialized weather forecast agent endpoint
          console.log("Using weather forecast agent");
          const prompt = await buildPromptWithUserContext(
            content,
            user?.fullName || "Farmer"
          );
          console.log("Using weather forecast agent 2");
          const agentResponse = await agriculturalAPI.getWeatherForecastAgent({
            query: prompt,
          });

          // Use the response from the agent
          const responseContent = agentResponse.success
            ? agentResponse.response ||
              "I received your weather query but couldn't generate a response."
            : `Weather forecast error: ${agentResponse.error || "Unknown error occurred"}`;

          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: responseContent,
            timestamp: new Date(),
            language: selectedLanguage,
            metadata: {
              agent_type: "weather-advisory",
              success: agentResponse.success,
              error: agentResponse.error,
            },
          };
        } else if (agentMode && currentSession?.agent?.id === "crop-yield") {
          // Use specialized crop yield agent endpoint
          console.log("Using crop yield agent");
          const prompt = await buildPromptWithUserContext(
            content,
            user?.fullName || "Farmer"
          );
          const agentResponse = await agriculturalAPI.getCropYieldAgent({
            query: prompt,
          });

          // Use the response from the agent
          const responseContent = agentResponse.success
            ? agentResponse.result ||
              "I received your crop yield query but couldn't generate a response."
            : `Crop yield prediction error: ${agentResponse.error || "Unknown error occurred"}`;

          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: responseContent,
            timestamp: new Date(),
            language: selectedLanguage,
            metadata: {
              agent_type: "crop-yield",
              success: agentResponse.success,
              result: agentResponse.result,
              error: agentResponse.error,
            },
          };
        } else if (
          agentMode &&
          currentSession?.agent?.id === "credit-loan-policy"
        ) {
          // Use specialized credit policy market agent endpoint
          console.log("Using credit policy market agent");
          const prompt = await buildPromptWithUserContext(
            content,
            user?.fullName || "Farmer"
          );
          const agentResponse =
            await agriculturalAPI.getCreditPolicyMarketAgent({
              query: prompt,
            });

          // Use the response from the agent
          const responseContent = agentResponse.success
            ? agentResponse.response ||
              "I received your credit policy query but couldn't generate a response."
            : `Credit policy analysis error: ${agentResponse.error || "Unknown error occurred"}`;

          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: responseContent,
            timestamp: new Date(),
            language: selectedLanguage,
            metadata: {
              agent_type: "credit-policy-market",
              success: agentResponse.success,
              response: agentResponse.response,
              error: agentResponse.error,
            },
          };
        } else if (
          agentMode &&
          currentSession?.agent?.id === "pest-prediction"
        ) {
          // Use specialized pest prediction agent endpoint
          console.log("Using pest prediction agent");
          const prompt = await buildPromptWithUserContext(
            content,
            user?.fullName || "Farmer"
          );
          const agentResponse = await agriculturalAPI.getPestPredictionAgent({
            query: prompt,
            // Note: imageFile would need to be passed from the files parameter if available
            imageFile: files?.[0],
          });

          // Format the response nicely
          let formattedResponse = agentResponse.success
            ? "Based on your query, here's my pest analysis:\n\n"
            : `Pest prediction error: ${agentResponse.error || "Unknown error occurred"}\n\n`;

          if (agentResponse.success && agentResponse.possible_pest_names) {
            formattedResponse += `🐛 **Possible Pests:**\n`;
            agentResponse.possible_pest_names.forEach((pest) => {
              formattedResponse += `• ${pest}\n`;
            });
            formattedResponse += `\n`;

            if (agentResponse.description) {
              formattedResponse += `📝 **Description:**\n${agentResponse.description}\n\n`;
            }

            if (agentResponse.pesticide_recommendation) {
              formattedResponse += `💊 **Pesticide Recommendation:**\n${agentResponse.pesticide_recommendation}\n\n`;
            }
          }

          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: formattedResponse,
            timestamp: new Date(),
            language: selectedLanguage,
            metadata: {
              agent_type: "pest-prediction",
              success: agentResponse.success,
              possible_pest_names: agentResponse.possible_pest_names,
              description: agentResponse.description,
              pesticide_recommendation: agentResponse.pesticide_recommendation,
              error: agentResponse.error,
            },
          };
        } else if (agentMode && currentSession?.agent?.id === "crop-health") {
          // Use specialized crop disease detection agent endpoint
          console.log("Using crop disease detection agent");
          const prompt = await buildPromptWithUserContext(
            content,
            user?.fullName || "Farmer"
          );

          // The new API supports both image-based and text-based analysis
          const agentResponse =
            await agriculturalAPI.getCropDiseaseDetectionAgent({
              imageFile: files?.[0], // Optional - can be undefined
              query: prompt,
            });

          // Format the response nicely
          let formattedResponse = agentResponse.success
            ? files && files.length > 0
              ? "Based on the image analysis, here's my crop health assessment:\n\n"
              : "Based on your description, here's my crop health analysis:\n\n"
            : `Crop disease detection error: ${agentResponse.error || "Unknown error occurred"}\n\n`;

          if (agentResponse.success && agentResponse.diseases) {
            formattedResponse += `🦠 **Detected Diseases:**\n`;
            agentResponse.diseases.forEach((disease, index) => {
              const probability = agentResponse.disease_probabilities?.[index];
              formattedResponse += `• ${disease}${probability ? ` (${(probability * 100).toFixed(1)}% confidence)` : ""}\n`;
            });
            formattedResponse += `\n`;

            if (agentResponse.symptoms && agentResponse.symptoms.length > 0) {
              formattedResponse += `🔍 **Symptoms:**\n`;
              agentResponse.symptoms.forEach((symptom) => {
                formattedResponse += `• ${symptom}\n`;
              });
              formattedResponse += `\n`;
            }

            if (
              agentResponse.Treatments &&
              agentResponse.Treatments.length > 0
            ) {
              formattedResponse += `💊 **Treatments:**\n`;
              agentResponse.Treatments.forEach((treatment) => {
                formattedResponse += `• ${treatment}\n`;
              });
              formattedResponse += `\n`;
            }

            if (
              agentResponse.prevention_tips &&
              agentResponse.prevention_tips.length > 0
            ) {
              formattedResponse += `🛡️ **Prevention Tips:**\n`;
              agentResponse.prevention_tips.forEach((tip) => {
                formattedResponse += `• ${tip}\n`;
              });
              formattedResponse += `\n`;
            }
          }

          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: formattedResponse,
            timestamp: new Date(),
            language: selectedLanguage,
            metadata: {
              agent_type: "crop-health",
              success: agentResponse.success,
              diseases: agentResponse.diseases,
              disease_probabilities: agentResponse.disease_probabilities,
              symptoms: agentResponse.symptoms,
              treatments: agentResponse.Treatments,
              prevention_tips: agentResponse.prevention_tips,
              error: agentResponse.error,
              has_image: !!(files && files.length > 0),
            },
          };
        } else if (agentMode && currentSession?.agent?.id === "market-prices") {
          // Use specialized market price agent endpoint
          console.log("Using market price agent");
          const prompt = await buildPromptWithUserContext(
            content,
            user?.fullName || "Farmer"
          );
          const agentResponse = await agriculturalAPI.getMarketPriceAgent({
            query: prompt,
          });

          // Use the response from the agent
          const responseContent = agentResponse.success
            ? agentResponse.response ||
              "I received your market price query but couldn't generate a response."
            : `Market price analysis error: ${agentResponse.error || "Unknown error occurred"}`;

          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: responseContent,
            timestamp: new Date(),
            language: selectedLanguage,
            metadata: {
              agent_type: "market-prices",
              success: agentResponse.success,
              error: agentResponse.error,
            },
          };
        } else if (
          agentMode &&
          (currentSession?.agent?.id === "risk-management" ||
            currentSession?.agent?.id === "price-forecasting")
        ) {
          // Use specialized risk management agent endpoint
          console.log("Using risk management agent");
          const prompt = await buildPromptWithUserContext(
            content,
            user?.fullName || "Farmer"
          );
          const agentResponse = await agriculturalAPI.getRiskManagementAgent({
            query: prompt,
          });

          // Format the response nicely
          let formattedResponse = agentResponse.success
            ? "Based on my analysis, here's your agricultural risk assessment:\n\n"
            : `Risk analysis error: ${agentResponse.error || "Unknown error occurred"}\n\n`;

          if (agentResponse.success) {
            if (agentResponse.risk_analysis) {
              formattedResponse += `📊 **Risk Analysis:**\n`;
              if (typeof agentResponse.risk_analysis === "string") {
                formattedResponse += `${agentResponse.risk_analysis}\n\n`;
              } else {
                formattedResponse += `${JSON.stringify(agentResponse.risk_analysis, null, 2)}\n\n`;
              }
            }

            if (
              agentResponse.recommendations &&
              agentResponse.recommendations.length > 0
            ) {
              formattedResponse += `💡 **Recommendations:**\n`;
              agentResponse.recommendations.forEach((recommendation) => {
                formattedResponse += `• ${recommendation}\n`;
              });
              formattedResponse += `\n`;
            }

            if (agentResponse.timestamp) {
              formattedResponse += `🕒 **Analysis Time:** ${agentResponse.timestamp}\n`;
            }
          }

          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: formattedResponse,
            timestamp: new Date(),
            language: selectedLanguage,
            metadata: {
              agent_type: "risk-management",
              success: agentResponse.success,
              risk_analysis: agentResponse.risk_analysis,
              recommendations: agentResponse.recommendations,
              timestamp: agentResponse.timestamp,
              error: agentResponse.error,
            },
          };
        } else if (agentMode && currentSession?.agent?.id === "deep-research") {
          // Use dedicated deep research API
          console.log("Using dedicated deep research API");

          const deepResearchResponse = await agriculturalAPI.getDeepResearch({
            query: content,
            response_format: "detailed", // Use detailed format by default
            max_iterations: 3,
          });

          let formattedResponse = deepResearchResponse.success
            ? "Here's your comprehensive agricultural research:\n\n"
            : `Research error: ${deepResearchResponse.metadata?.error || "Unknown error occurred"}\n\n`;

          if (deepResearchResponse.success) {
            formattedResponse += deepResearchResponse.response;

            // Add metadata information
            if (deepResearchResponse.metadata) {
              const meta = deepResearchResponse.metadata;
              formattedResponse += "\n\n---\n**Research Details:**\n";

              if (meta.execution_id) {
                formattedResponse += `🔍 **Execution ID:** ${meta.execution_id}\n`;
              }
              if (meta.total_agents) {
                formattedResponse += `🤖 **Agents Used:** ${meta.total_agents}\n`;
              }
              if (meta.success_rate) {
                formattedResponse += `✅ **Success Rate:** ${meta.success_rate}\n`;
              }
              if (meta.tools_used && meta.tools_used.length > 0) {
                formattedResponse += `�️ **Tools:** ${meta.tools_used.join(", ")}\n`;
              }
            }

            formattedResponse += `⏱️ **Processing Time:** ${deepResearchResponse.execution_time_seconds.toFixed(2)}s`;
          }

          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: formattedResponse,
            timestamp: new Date(),
            language: selectedLanguage,
            metadata: {
              agent_type: "deep-research",
              success: deepResearchResponse.success,
              processing_time: deepResearchResponse.execution_time_seconds,
              final_mode: "deep-research",
              switched_modes: false,
              is_answer_complete: deepResearchResponse.success,
              is_image_query: false,
              error: deepResearchResponse.metadata?.error,
            },
          };
        } else {
          // Use secure chat API route for generic queries and multilingual support
          console.log(
            "Using secure chat API route for generic/multilingual support"
          );

          // Check if this is a translation request or multilingual query
          const isTranslationQuery =
            content.toLowerCase().includes("translate") ||
            content.toLowerCase().includes("translation") ||
            selectedLanguage !== "en";

          // Use current tools enabled state from ref to avoid stale closure
          const currentToolsEnabled = toolsEnabledRef.current;

          // Use RAG mode when tools are disabled, or for translation queries
          const shouldUseRAG = !currentToolsEnabled || isTranslationQuery;
          const mode = shouldUseRAG ? "rag" : "tooling";

          console.log(
            `Using chat API in ${mode} mode (tools ${currentToolsEnabled ? "enabled" : "disabled"}, translation query: ${isTranslationQuery})`
          );

          const prompt = await buildPromptWithUserContext(
            content,
            user?.fullName || "Farmer"
          );

          // Call our secure API route instead of direct agricultural API
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: prompt,
              files: files,
              mode: mode,
              turnstileToken: turnstileToken,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Chat API failed");
          }

          const agentResponse = await response.json();

          const responseContent = agentResponse.success
            ? agentResponse.response ||
              "I received your query but couldn't generate a response."
            : `Error: ${agentResponse.error || "Unknown error occurred"}`;

          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: responseContent,
            timestamp: new Date(),
            language: selectedLanguage,
            metadata: {
              agent_type: currentSession?.agent?.id || "generic",
              success: agentResponse.success,
              answer_quality_grade: agentResponse.answer_quality_grade,
              processing_time: agentResponse.processing_time,
              mode: mode,
              error: agentResponse.error,
            },
          };
        }

        setChatSessions((prev) =>
          prev.map((session) =>
            session.id === sessionId // ✅ use local sessionId, never stale
              ? {
                  ...session,
                  messages: [...session.messages, assistantMessage],
                  updatedAt: new Date(),
                }
              : session
          )
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
              : session
          )
        );
      } finally {
        setIsLoading(false);
        // Reset Turnstile token after use
        setTurnstileToken("");
      }
    },
    [
      currentSessionId,
      createNewChat,
      selectedLanguage,
      agentMode,
      currentSession,
      turnstileToken,
    ]
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
      "credit-loan-policy":
        "What agricultural finance or market intelligence do you need?",
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
          />
          <div className="p-3 border-t">
            <div className="flex justify-center">
              {!turnstileToken ? (
                <div
                  style={{
                    borderRadius: "0.5rem",
                    border: "1px solid #e5e7eb",
                    padding: "0.75rem 1.5rem",
                    background: "#fff",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    minWidth: 260,
                    maxWidth: 340,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Turnstile
                    siteKey={
                      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
                      "0x4AAAAAABu9IhavKy4c6vpY"
                    }
                    onSuccess={(token) => {
                      console.log("Turnstile verification successful");
                      setTurnstileToken(token);
                    }}
                    onError={(error) => {
                      console.error("Turnstile verification failed:", error);
                      setTurnstileToken("");
                    }}
                    onExpire={() => {
                      console.log("Turnstile token expired");
                      setTurnstileToken("");
                    }}
                    options={{
                      theme: "light",
                      size: "compact",
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Verified</span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Deep Research Component (inline)
    if (currentSession.agent.id === "deep-research") {
      const [deepQuery, setDeepQuery] = useState("");
      const [responseFormat, setResponseFormat] = useState<
        "simple" | "detailed" | "executive"
      >("detailed");
      const [maxIterations, setMaxIterations] = useState(3);
      const [deepIsLoading, setDeepIsLoading] = useState(false);
      const [deepResult, setDeepResult] = useState<any>(null);
      const [deepError, setDeepError] = useState("");

      const handleDeepSubmit = async () => {
        if (!deepQuery.trim()) {
          setDeepError("Please enter a research query");
          return;
        }

        if (deepQuery.length < 10) {
          setDeepError(
            "Please provide a more detailed query (at least 10 characters)"
          );
          return;
        }

        setDeepIsLoading(true);
        setDeepError("");
        setDeepResult(null);

        try {
          const request = {
            query: deepQuery.trim(),
            response_format: responseFormat,
            max_iterations: maxIterations,
          };

          const response = await agriculturalAPI.getDeepResearch(request);
          setDeepResult(response);
        } catch (error) {
          console.error("Error conducting deep research:", error);
          setDeepError(
            error instanceof Error
              ? error.message
              : "Failed to conduct research. Please try again."
          );
        } finally {
          setDeepIsLoading(false);
        }
      };

      const resetDeepForm = () => {
        setDeepQuery("");
        setDeepResult(null);
        setDeepError("");
      };

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 p-3">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-600 to-slate-700 rounded-full shadow-lg">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-slate-800 bg-clip-text text-transparent">
                  Deep Agricultural Research
                </h1>
                <p className="text-sm text-gray-600">
                  Comprehensive AI-powered agricultural research and analysis
                </p>
              </div>
            </div>

            <Card className="border-gray-200 shadow-md">
              <CardHeader className="bg-gradient-to-r from-gray-600 to-slate-700 text-white rounded-t-lg py-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Search className="w-4 h-4" />
                  Research Query
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="query"
                    className="text-gray-700 font-medium text-sm"
                  >
                    Research Question
                  </Label>
                  <Textarea
                    id="query"
                    value={deepQuery}
                    onChange={(e) => setDeepQuery(e.target.value)}
                    placeholder="Enter your detailed agricultural research question (e.g., 'I want to grow tomatoes in my farm, need fertilizer recommendations and market prices')"
                    className="border-gray-200 focus:border-gray-500 focus:ring-gray-500 min-h-[100px] text-sm"
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-500">
                    {deepQuery.length}/1000 characters (minimum 10 required)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium text-sm">
                      Response Format
                    </Label>
                    <Select
                      value={responseFormat}
                      onValueChange={(value: any) => setResponseFormat(value)}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-gray-500 focus:ring-gray-500 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>
                              Simple - Quick actionable recommendations
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="detailed">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>Detailed - Comprehensive analysis</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="executive">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span>Executive - High-level summary</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium text-sm">
                      Research Depth (Iterations)
                    </Label>
                    <Select
                      value={maxIterations.toString()}
                      onValueChange={(value) =>
                        setMaxIterations(parseInt(value))
                      }
                    >
                      <SelectTrigger className="border-gray-200 focus:border-gray-500 focus:ring-gray-500 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Basic research</SelectItem>
                        <SelectItem value="2">2 - Standard research</SelectItem>
                        <SelectItem value="3">
                          3 - Deep research (recommended)
                        </SelectItem>
                        <SelectItem value="4">4 - Thorough research</SelectItem>
                        <SelectItem value="5">
                          5 - Comprehensive research
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleDeepSubmit}
                    disabled={deepIsLoading || deepQuery.length < 10}
                    className="bg-gradient-to-r from-gray-600 to-slate-700 hover:from-gray-700 hover:to-slate-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deepIsLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Researching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Start Research
                      </>
                    )}
                  </Button>

                  {deepResult && (
                    <Button
                      onClick={resetDeepForm}
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      New Research
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Error Display */}
            {deepError && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Error</span>
                  </div>
                  <p className="text-red-600 mt-2">{deepError}</p>
                </CardContent>
              </Card>
            )}

            {/* Results Display */}
            {deepResult && (
              <Card className="border-gray-200 bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-800 flex items-center gap-2">
                    {deepResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    Research Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {/* Research Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        {deepResult.execution_time_seconds?.toFixed(2)}s
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        {deepResult.response_format} format
                      </span>
                    </div>
                    {deepResult.metadata?.success_rate && (
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-700">
                          {deepResult.metadata.success_rate} success
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Main Response */}
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                    >
                      {deepResult.response}
                    </ReactMarkdown>
                  </div>

                  {/* Additional Metadata */}
                  {deepResult.metadata &&
                    Object.keys(deepResult.metadata).length > 0 && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Research Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                          {deepResult.metadata.total_agents && (
                            <div>
                              Agents Used: {deepResult.metadata.total_agents}
                            </div>
                          )}
                          {deepResult.metadata.tools_used &&
                            deepResult.metadata.tools_used.length > 0 && (
                              <div>
                                Tools:{" "}
                                {deepResult.metadata.tools_used.join(", ")}
                              </div>
                            )}
                          {deepResult.metadata.iterations_completed && (
                            <div>
                              Iterations:{" "}
                              {deepResult.metadata.iterations_completed}
                            </div>
                          )}
                          {deepResult.metadata.execution_id && (
                            <div>ID: {deepResult.metadata.execution_id}</div>
                          )}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}
          </div>
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
      case "personalised-section":
        return <PersonalizationPage />;
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

            {/* Left Section: Saving + Agent info */}
            <div className="flex items-center gap-2">
              {isSaving && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <div className="h-3 w-3 animate-spin rounded-full border border-emerald-500 border-t-transparent"></div>
                  <span className="hidden sm:inline">Saving...</span>
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

            {/* Right Section: Toggles + API Health */}
            <div className="ml-auto flex items-center gap-3">
              {currentSession?.agent &&
                currentSession.agent.mode === "both" && (
                  <div className="flex items-center gap-2">
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

              {/* Compact API Health Check */}
              <APIHealthCheck />
            </div>
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
                  switchMode={true}
                  onToolsEnabledChange={handleToolsEnabledChange}
                />
                <div className="p-3 border-t">
                  <div className="flex justify-center">
                    {!turnstileToken ? (
                      <Turnstile
                        siteKey={
                          process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
                          "0x4AAAAAABu9IhavKy4c6vpY"
                        }
                        onSuccess={(token) => {
                          console.log("Turnstile verification successful");
                          setTurnstileToken(token);
                        }}
                        onError={(error) => {
                          console.error(
                            "Turnstile verification failed:",
                            error
                          );
                          setTurnstileToken("");
                        }}
                        onExpire={() => {
                          console.log("Turnstile token expired");
                          setTurnstileToken("");
                        }}
                        options={{
                          theme: "light",
                          size: "compact",
                        }}
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

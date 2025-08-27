/* eslint-disable prettier/prettier */
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
import { APIHealthCheck } from "@/components/api-health-check";
import { buildPromptWithUserContext } from "@/lib/utils";
import { getUser } from "@/lib/actions/getUser";
import { Turnstile } from "@marsidev/react-turnstile";
import {PersonalizationPage} from "@/components/personalised-section";

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
          // Use specialized workflow agent for deep research
          const currentToolsEnabled = toolsEnabledRef.current;
          const mode = currentToolsEnabled ? "tooling" : "rag";
          console.log(
            `Using workflow agent for deep research in ${mode} mode (tools ${currentToolsEnabled ? "enabled" : "disabled"})`
          );
          const prompt = await buildPromptWithUserContext(
            content,
            user?.fullName || "Farmer"
          );
          const agentResponse = await agriculturalAPI.getWorkflowAgent({
            query: prompt,
            mode: mode,
            image: files?.[0],
          });

          let formattedResponse = agentResponse.success
            ? "Here's what I found through deep research:\n\n"
            : `Research error: ${agentResponse.error || "Unknown error occurred"}\n\n`;

          if (agentResponse.success && agentResponse.response) {
            // Clean the response to remove chart path references since we'll display charts visually
            let cleanedResponse = agentResponse.response;
            if (agentResponse.chart_path) {
              // Remove any mentions of chart file paths from the response
              cleanedResponse = cleanedResponse.replace(
                /Chart available at:.*$/gm,
                ""
              );
              cleanedResponse = cleanedResponse.replace(
                /The attached chart.*$/gm,
                ""
              );
              cleanedResponse = cleanedResponse.trim();
            }

            formattedResponse += cleanedResponse;

            if (agentResponse.answer_quality_grade) {
              formattedResponse += `\n\n📊 **Answer Quality Score:** ${JSON.stringify(agentResponse.answer_quality_grade)}`;
            }

            if (agentResponse.processing_time) {
              formattedResponse += `\n⏱️ **Processing Time:** ${agentResponse.processing_time.toFixed(2)}s`;
            }
          }

          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: formattedResponse,
            timestamp: new Date(),
            language: selectedLanguage,
            metadata: {
              agent_type: "deep-research",
              success: agentResponse.success,
              answer_quality_grade: agentResponse.answer_quality_grade,
              processing_time: agentResponse.processing_time,
              mode: mode,
              error: agentResponse.error,
              chart_path: agentResponse.chart_path,
              chart_extra_message: agentResponse.chart_extra_message,
              is_answer_complete: agentResponse.is_answer_complete,
              final_mode: agentResponse.final_mode,
              switched_modes: agentResponse.switched_modes,
              is_image_query: agentResponse.is_image_query,
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

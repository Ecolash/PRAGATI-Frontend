/* eslint-disable prettier/prettier */
import { PrismaClient } from "@prisma/client";
import { ChatSession, ChatMessage } from "@/types/agriculture";

const prisma = new PrismaClient();

export interface SaveChatSessionData {
  id: string;
  title: string;
  agentId?: string;
  agentName?: string;
  language: string;
  messages: ChatMessage[];
  userId: number;
}

export interface ChatHistoryService {
  saveChatSession(data: SaveChatSessionData): Promise<void>;
  loadUserChatSessions(userId: number): Promise<ChatSession[]>;
  updateChatSession(
    sessionId: string,
    data: Partial<SaveChatSessionData>
  ): Promise<void>;
  deleteChatSession(sessionId: string, userId: number): Promise<void>;
  addMessageToSession(sessionId: string, message: ChatMessage): Promise<void>;
}

class DatabaseChatHistoryService implements ChatHistoryService {
  async saveChatSession(data: SaveChatSessionData): Promise<void> {
    try {
      // Check if session already exists
      const existingSession = await prisma.chatSession.findUnique({
        where: { id: data.id },
      });

      if (existingSession) {
        // Update existing session
        await prisma.chatSession.update({
          where: { id: data.id },
          data: {
            title: data.title,
            agentId: data.agentId,
            agentName: data.agentName,
            language: data.language,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new session
        await prisma.chatSession.create({
          data: {
            id: data.id,
            title: data.title,
            userId: data.userId,
            agentId: data.agentId,
            agentName: data.agentName,
            language: data.language,
          },
        });
      }

      // Save messages
      for (const message of data.messages) {
        await this.saveMessage(data.id, message);
      }
    } catch (error) {
      console.error("Failed to save chat session:", error);
      throw new Error("Failed to save chat session");
    }
  }

  async loadUserChatSessions(userId: number): Promise<ChatSession[]> {
    try {
      const sessions = await prisma.chatSession.findMany({
        where: { userId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      return sessions.map((session: any) => ({
        id: session.id,
        title: session.title,
        messages: session.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
          timestamp: new Date(msg.createdAt), // Convert to Date object
          language: msg.language || undefined,
          translations:
            (msg.translations as Record<string, string>) || undefined,
          metadata: (msg.metadata as any) || undefined,
          attachments: (msg.attachments as any) || undefined,
          error: msg.error || undefined,
        })),
        agent: session.agentId
          ? {
              id: session.agentId,
              name: session.agentName || "Unknown Agent",
              description: "",
              icon: null,
              category: "analysis" as const,
              color: "",
            }
          : undefined,
        createdAt: new Date(session.createdAt), // Convert to Date object
        updatedAt: new Date(session.updatedAt), // Convert to Date object
        language: session.language,
      }));
    } catch (error) {
      console.error("Failed to load chat sessions:", error);
      throw new Error("Failed to load chat sessions");
    }
  }

  async updateChatSession(
    sessionId: string,
    data: Partial<SaveChatSessionData>
  ): Promise<void> {
    try {
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: {
          title: data.title,
          agentId: data.agentId,
          agentName: data.agentName,
          language: data.language,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Failed to update chat session:", error);
      throw new Error("Failed to update chat session");
    }
  }

  async deleteChatSession(sessionId: string, userId: number): Promise<void> {
    try {
      await prisma.chatSession.delete({
        where: {
          id: sessionId,
          userId: userId, // Ensure user owns the session
        },
      });
    } catch (error) {
      console.error("Failed to delete chat session:", error);
      throw new Error("Failed to delete chat session");
    }
  }

  async addMessageToSession(
    sessionId: string,
    message: ChatMessage
  ): Promise<void> {
    try {
      await this.saveMessage(sessionId, message);

      // Update session timestamp
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() },
      });
    } catch (error) {
      console.error("Failed to add message to session:", error);
      throw new Error("Failed to add message to session");
    }
  }

  private async saveMessage(
    sessionId: string,
    message: ChatMessage
  ): Promise<void> {
    try {
      await prisma.chatMessage.upsert({
        where: { id: message.id },
        update: {
          content: message.content,
          language: message.language,
          translations: message.translations || {},
          metadata: message.metadata || {},
          attachments: message.attachments || [],
          error: message.error,
        },
        create: {
          id: message.id,
          sessionId: sessionId,
          role: message.role,
          content: message.content,
          language: message.language,
          translations: message.translations || {},
          metadata: message.metadata || {},
          attachments: message.attachments || [],
          error: message.error,
          createdAt: message.timestamp,
        },
      });
    } catch (error) {
      console.error("Failed to save message:", error);
      throw error;
    }
  }
}

export const chatHistoryService = new DatabaseChatHistoryService();

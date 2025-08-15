/* eslint-disable prettier/prettier */
// API service for connecting to FastAPI backend
import { config } from "./config";

export interface AgriculturalQueryRequest {
  query: string;
  language?: string;
  context?: {
    agent_type?: string;
    previous_messages?: Array<{
      role: "user" | "assistant";
      content: string;
    }>;
  };
}

export interface AgriculturalQueryResponse {
  response: string;
  language: string;
  confidence?: number;
  sources?: string[];
  agent_type?: string;
}

class AgriculturalAPIService {
  private baseUrl: string;

  constructor(baseUrl: string = config.apiUrl) {
    this.baseUrl = baseUrl;
  }

  async sendQuery(
    request: AgriculturalQueryRequest
  ): Promise<AgriculturalQueryResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/agriculture/respond`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error calling agricultural API:", error);
      throw new Error(
        `Failed to get agricultural response: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async healthCheck(): Promise<{ status: string; service: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Health check failed:", error);
      throw error;
    }
  }
}
export const agriculturalAPI = new AgriculturalAPIService();

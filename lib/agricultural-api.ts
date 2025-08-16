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

export interface CropDiseaseDetectionResponse {
  success: boolean;
  diseases?: string[];
  disease_probabilities?: number[];
  symptoms?: string[];
  Treatments?: string[];
  prevention_tips?: string[];
  image_path?: string;
  error?: string;
}

export interface PestPredictionResponse {
  success: boolean;
  possible_pest_names?: string[];
  description?: string;
  pesticide_recommendation?: string;
  error?: string;
}

export interface WebScrappingRequest {
  query: string;
}

export interface WebScrappingResponse {
  success: boolean;
  data?: any;
  sources?: string[];
  error?: string;
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
          body: JSON.stringify({
            query: request.query,
            preferred_response_lang: request.language,
            context: request.context,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // Handle the response structure from your FastAPI backend
      if (data.success && data.response) {
        return {
          response: data.response,
          language: data.response_language || request.language || "en",
          confidence: undefined, // Your backend doesn't seem to provide this
          sources: undefined, // Your backend doesn't seem to provide this
          agent_type: request.context?.agent_type,
        };
      } else {
        throw new Error(data.error || "Failed to get response from AI");
      }
    } catch (error) {
      console.error("Error calling agricultural API:", error);
      throw new Error(
        `Failed to get agricultural response: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async translateText(
    text: string,
    targetLanguage: string
  ): Promise<{ translated_text: string; source_language: string }> {
    console.log("=== API TRANSLATION DEBUG ===");
    console.log("Text to translate:", text.substring(0, 100) + "...");
    console.log("Target Language:", targetLanguage);
    console.log("API URL:", `${this.baseUrl}/api/v1/agriculture/translate`);
    console.log("============================");

    try {
      const requestBody = {
        text,
        target_lang: targetLanguage,
        source_lang: "auto",
      };

      console.log("Request Body:", requestBody);

      const response = await fetch(
        `${this.baseUrl}/api/v1/agriculture/translate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log("Response Status:", response.status);
      console.log("Response OK:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error Response Body:", errorText);
        throw new Error(
          `Translation failed: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("API Response:", result);

      // Handle the response structure from your FastAPI backend
      if (result.success) {
        console.log("Translation successful!");
        return {
          translated_text: result.translated_text,
          source_language: result.source_language || "auto",
        };
      } else {
        console.error("Translation failed - API returned success: false");
        throw new Error(result.error || "Translation failed");
      }
    } catch (error) {
      console.error("Translation error:", error);
      throw error;
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

  async detectCropDisease(
    imageFile: File
  ): Promise<CropDiseaseDetectionResponse> {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      console.log("=== CROP DISEASE DETECTION DEBUG ===");
      console.log("Image file:", imageFile.name, imageFile.size);
      console.log("API URL:", `${this.baseUrl}/api/v1/cropdisease/detect`);
      console.log("====================================");

      const response = await fetch(
        `${this.baseUrl}/api/v1/cropdisease/detect`,
        {
          method: "POST",
          body: formData,
        }
      );

      console.log("Response Status:", response.status);
      console.log("Response OK:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error Response Body:", errorText);
        throw new Error(
          `Crop disease detection failed: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("API Response:", result);

      return result;
    } catch (error) {
      console.error("Crop disease detection error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async predictPest(
    query: string,
    imageFile?: File
  ): Promise<PestPredictionResponse> {
    try {
      const formData = new FormData();
      formData.append("query", query);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      console.log("=== PEST PREDICTION DEBUG ===");
      console.log("Query:", query);
      if (imageFile) {
        console.log("Image file:", imageFile.name, imageFile.size);
      }
      console.log("API URL:", `${this.baseUrl}/api/v1/pest/predict`);
      console.log("============================");

      const response = await fetch(`${this.baseUrl}/api/v1/pest/predict`, {
        method: "POST",
        body: formData,
      });

      console.log("Response Status:", response.status);
      console.log("Response OK:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error Response Body:", errorText);
        throw new Error(
          `Pest prediction failed: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("API Response:", result);

      return result;
    } catch (error) {
      console.error("Pest prediction error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async scrapeWebData(query: string): Promise<WebScrappingResponse> {
    try {
      console.log("=== WEB SCRAPING DEBUG ===");
      console.log("Query:", query);
      console.log("API URL:", `${this.baseUrl}/api/v1/webscrap/scrape`);
      console.log("==========================");

      const response = await fetch(`${this.baseUrl}/api/v1/webscrap/scrape`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      console.log("Response Status:", response.status);
      console.log("Response OK:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error Response Body:", errorText);
        throw new Error(
          `Web scraping failed: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("API Response:", result);

      return result;
    } catch (error) {
      console.error("Web scraping error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}
export const agriculturalAPI = new AgriculturalAPIService();

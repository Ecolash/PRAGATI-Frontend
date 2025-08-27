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
  diseases?: string[]; // Updated to match the new schema (list of strings)
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

export interface WeatherForecastRequest {
  latitude: number;
  longitude: number;
}

export interface WeatherForecastResponse {
  success: boolean;
  response?: any; // The structured weather data from the tool
  error?: string;
}

export interface CropRecommendationAgentRequest {
  prompt: string;
}

export interface CropRecommendationAgentResponse {
  crop_names: string[];
  confidence_scores: number[];
  justifications: string[];
}

export interface WeatherForecastAgentRequest {
  query: string;
}

export interface WeatherForecastAgentResponse {
  success: boolean;
  response?: string;
  error?: string;
}

export interface PestPredictionAgentRequest {
  query: string;
  imageFile?: File;
}

export interface PestPredictionAgentResponse {
  success: boolean;
  possible_pest_names?: string[];
  description?: string;
  pesticide_recommendation?: string;
  error?: string;
}

export interface CropDiseaseDetectionAgentRequest {
  imageFile?: File; // Now optional since the new API supports detection without images
  query?: string;
}

export interface CropDiseaseDetectionAgentResponse {
  success: boolean;
  diseases?: string[];
  disease_probabilities?: number[];
  symptoms?: string[];
  Treatments?: string[];
  prevention_tips?: string[];
  image_path?: string;
  error?: string;
}

export interface MarketPriceAgentRequest {
  query: string;
}

export interface MarketPriceAgentResponse {
  success: boolean;
  response?: string;
  error?: string;
}

export interface RiskManagementAgentRequest {
  query: string;
}

export interface RiskManagementAgentResponse {
  success: boolean;
  risk_analysis?: any;
  recommendations?: string[];
  timestamp?: string;
  error?: string;
}

export interface WorkflowAgentRequest {
  query: string;
  mode: "rag" | "tooling";
  image?: File;
}

export interface WorkflowAgentResponse {
  success: boolean;
  response?: string;
  answer?: string;
  answer_quality_grade?: Record<string, any>;
  is_answer_complete?: boolean;
  final_mode?: string;
  switched_modes?: boolean;
  is_image_query?: boolean;
  chart_path?: string;
  chart_extra_message?: string;
  processing_time?: number;
  error?: string;
}

export interface CropYieldAgentRequest {
  query: string;
}

export interface CropYieldAgentResponse {
  success: boolean;
  result?: string;
  error?: string;
}

export interface CreditPolicyMarketAgentRequest {
  query: string;
}

export interface CreditPolicyMarketAgentResponse {
  success: boolean;
  response?: string;
  error?: string;
}

export interface CropRecommendationRequest {
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
  model_type?: string;
}

export interface CropRecommendationResponse {
  status: string;
  model_used: string;
  input_parameters: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
  };
  predictions: {
    recommended_crop: string;
    top_5_recommendations: Array<{
      crop: string;
      confidence_score: number;
      confidence_percentage: number;
    }>;
  };
  metadata: {
    total_classes: number;
    prediction_timestamp: string;
  };
}

export interface FertilizerRecommendationRequest {
  temperature: number;
  humidity: number;
  moisture: number;
  soil_type: string;
  crop_type: string;
  nitrogen: number;
  potassium: number;
  phosphorous: number;
}

export interface FertilizerRecommendationResponse {
  success: boolean;
  recommended_fertilizer?: string;
  confidence?: number;
  top_3_recommendations?: Array<[string, number]>; // [fertilizer_name, confidence]
  input_parameters?: {
    temperature: number;
    humidity: number;
    moisture: number;
    soil_type: string;
    crop_type: string;
    nitrogen: number;
    potassium: number;
    phosphorous: number;
  };
  validation_errors?: string[];
  error?: string;
}

export interface NewsQueryRequest {
  query: string;
}

export interface NewsQueryResponse {
  success: boolean;
  response?: string;
  error?: string;
}

export interface CropYieldRequest {
  state_name: string;
  district_name: string;
  crop_year: number;
  season: string;
  crop: string;
  temperature: number;
  humidity: number;
  soil_moisture: number;
  area: number;
  model_type?: string;
}

export interface CropYieldResponse {
  status: string;
  model_used?: string;
  input_parameters?: {
    state_name: string;
    district_name: string;
    crop_year: number;
    season: string;
    crop: string;
    temperature: number;
    humidity: number;
    soil_moisture: number;
    area_hectares: number;
  };
  predictions?: {
    total_production: number;
    yield_per_hectare: number;
    production_unit: string;
    confidence_interval: {
      lower_bound: number;
      upper_bound: number;
      confidence_level: string;
    };
  };
  analysis?: {
    productivity_rating: string;
    seasonal_suitability: string;
    regional_context: string;
  };
  feature_importance?: {
    temperature: number;
    humidity: number;
    soil_moisture: number;
    area: number;
    year: number;
  };
  metadata?: {
    prediction_timestamp: string;
    model_version: string;
    data_source: string;
  };
  error_message?: string;
  error_timestamp?: string;
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

  async getWeatherForecast(
    latitude: number,
    longitude: number
  ): Promise<WeatherForecastResponse> {
    try {
      console.log("=== WEATHER FORECAST TOOL DEBUG ===");
      console.log("Latitude:", latitude);
      console.log("Longitude:", longitude);

      // Build URL with query parameters
      const url = new URL(`${this.baseUrl}/api/v1/weather/forecast-tool`);
      url.searchParams.append("latitude", latitude.toString());
      url.searchParams.append("longitude", longitude.toString());

      console.log("API URL with query params:", url.toString());
      console.log("===================================");

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response Status:", response.status);
      console.log("Response OK:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error Response Body:", errorText);
        throw new Error(
          `Weather forecast failed: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("API Response:", result);

      // Return the weather data wrapped in the expected format
      return {
        success: true,
        response: result,
      };
    } catch (error) {
      console.error("Weather forecast error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async getCropRecommendation(
    request: CropRecommendationRequest
  ): Promise<CropRecommendationResponse> {
    try {
      console.log("=== CROP RECOMMENDATION TOOL DEBUG ===");
      console.log("Request Parameters:", request);

      const url = new URL(`${this.baseUrl}/api/v1/crop-recommendation`);
      url.searchParams.append("N", request.N.toString());
      url.searchParams.append("P", request.P.toString());
      url.searchParams.append("K", request.K.toString());
      url.searchParams.append("temperature", request.temperature.toString());
      url.searchParams.append("humidity", request.humidity.toString());
      url.searchParams.append("ph", request.ph.toString());
      url.searchParams.append("rainfall", request.rainfall.toString());
      url.searchParams.append("model_type", request.model_type || "stacked");

      console.log("API URL with query params:", url.toString());
      console.log("======================================");

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response Status:", response.status);
      console.log("Response OK:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error Response Body:", errorText);
        throw new Error(
          `Crop recommendation failed: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("API Response:", result);
      console.log("API Response Type:", typeof result);

      // If the result is a string, try to parse it as JSON
      if (typeof result === "string") {
        console.log("Result is a string, attempting to parse JSON...");
        try {
          const parsedResult = JSON.parse(result);
          console.log("Parsed result:", parsedResult);
          return parsedResult;
        } catch (parseError) {
          console.error("Failed to parse JSON string:", parseError);
          throw new Error("API returned invalid JSON string");
        }
      }

      return result;
    } catch (error) {
      console.error("Crop recommendation error:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to get crop recommendation"
      );
    }
  }

  async getFertilizerRecommendation(
    request: FertilizerRecommendationRequest
  ): Promise<FertilizerRecommendationResponse> {
    try {
      console.log("=== FERTILIZER RECOMMENDATION TOOL DEBUG ===");
      console.log("Request Parameters:", request);

      const url = new URL(`${this.baseUrl}/api/v1/fertilizer/recommendation`);
      url.searchParams.append("temperature", request.temperature.toString());
      url.searchParams.append("humidity", request.humidity.toString());
      url.searchParams.append("moisture", request.moisture.toString());
      url.searchParams.append("soil_type", request.soil_type);
      url.searchParams.append("crop_type", request.crop_type);
      url.searchParams.append("nitrogen", request.nitrogen.toString());
      url.searchParams.append("potassium", request.potassium.toString());
      url.searchParams.append("phosphorous", request.phosphorous.toString());

      console.log("API URL with query params:", url.toString());
      console.log("========================================");

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response Status:", response.status);
      console.log("Response OK:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error Response Body:", errorText);
        throw new Error(
          `Fertilizer recommendation failed: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("API Response:", result);
      console.log("API Response Type:", typeof result);

      // If the result is a string, try to parse it as JSON
      if (typeof result === "string") {
        console.log("Result is a string, attempting to parse JSON...");
        try {
          const parsedResult = JSON.parse(result);
          console.log("Parsed result:", parsedResult);
          return parsedResult;
        } catch (parseError) {
          console.error("Failed to parse JSON string:", parseError);
          throw new Error("API returned invalid JSON string");
        }
      }

      return result;
    } catch (error) {
      console.error("Fertilizer recommendation error:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to get fertilizer recommendation"
      );
    }
  }

  async getAgriculturalNews(
    request: NewsQueryRequest
  ): Promise<NewsQueryResponse> {
    try {
      console.log("=== AGRICULTURAL NEWS TOOL DEBUG ===");
      console.log("Request Query:", request.query);

      const response = await fetch(`${this.baseUrl}/api/v1/agent/agri-news`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: request.query }),
      });

      console.log("Response Status:", response.status);
      console.log("Response OK:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error Response Body:", errorText);
        throw new Error(
          `Agricultural news failed: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("API Response:", result);
      console.log("API Response Type:", typeof result);

      // If the result is a string, try to parse it as JSON
      if (typeof result === "string") {
        console.log("Result is a string, attempting to parse JSON...");
        try {
          const parsedResult = JSON.parse(result);
          console.log("Parsed result:", parsedResult);
          return parsedResult;
        } catch (parseError) {
          console.error("Failed to parse JSON string:", parseError);
          throw new Error("API returned invalid JSON string");
        }
      }

      return result;
    } catch (error) {
      console.error("Agricultural news error:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to get agricultural news"
      );
    }
  }

  async getCropYieldPrediction(
    request: CropYieldRequest
  ): Promise<CropYieldResponse> {
    try {
      console.log("=== CROP YIELD PREDICTION TOOL DEBUG ===");
      console.log("Request Parameters:", request);

      const url = new URL(`${this.baseUrl}/api/v1/crop-yield/predict`);
      url.searchParams.append("state_name", request.state_name);
      url.searchParams.append("district_name", request.district_name);
      url.searchParams.append("crop_year", request.crop_year.toString());
      url.searchParams.append("season", request.season);
      url.searchParams.append("crop", request.crop);
      url.searchParams.append("temperature", request.temperature.toString());
      url.searchParams.append("humidity", request.humidity.toString());
      url.searchParams.append(
        "soil_moisture",
        request.soil_moisture.toString()
      );
      url.searchParams.append("area", request.area.toString());
      url.searchParams.append("model_type", request.model_type || "stacked_2");

      console.log("API URL with query params:", url.toString());
      console.log("======================================");

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response Status:", response.status);
      console.log("Response OK:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error Response Body:", errorText);
        throw new Error(
          `Crop yield prediction failed: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("API Response:", result);
      console.log("API Response Type:", typeof result);

      // If the result is a string, try to parse it as JSON
      if (typeof result === "string") {
        console.log("Result is a string, attempting to parse JSON...");
        try {
          const parsedResult = JSON.parse(result);
          console.log("Parsed result:", parsedResult);
          return parsedResult;
        } catch (parseError) {
          console.error("Failed to parse JSON string:", parseError);
          throw new Error("API returned invalid JSON string");
        }
      }

      return result;
    } catch (error) {
      console.error("Crop yield prediction error:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to get crop yield prediction"
      );
    }
  }

  // New method for crop recommendation agent mode
  async getCropRecommendationAgent(
    request: CropRecommendationAgentRequest
  ): Promise<CropRecommendationAgentResponse> {
    try {
      console.log("=== CROP RECOMMENDATION AGENT DEBUG ===");
      console.log("Prompt:", request.prompt);

      const response = await fetch(
        `${this.baseUrl}/api/v1/crop-recommender/crop-recommendation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: request.prompt,
          }),
        }
      );

      console.log("Response Status:", response.status);
      console.log("Response OK:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error Response Body:", errorText);
        throw new Error(
          `Crop recommendation agent failed: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("API Response:", data);

      return {
        crop_names: data.crop_names || [],
        confidence_scores: data.confidence_scores || [],
        justifications: data.justifications || [],
      };
    } catch (error) {
      console.error("Error calling crop recommendation agent:", error);
      throw new Error(
        `Failed to get crop recommendation response: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // New method for weather forecasting agent mode
  async getWeatherForecastAgent(
    request: WeatherForecastAgentRequest
  ): Promise<WeatherForecastAgentResponse> {
    try {
      console.log("=== WEATHER FORECAST AGENT DEBUG ===");
      console.log("Query:", request.query);

      const response = await fetch(`${this.baseUrl}/api/v1/weather/forecast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: request.query,
        }),
      });

      console.log("Response Status:", response.status);
      console.log("Response OK:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error Response Body:", errorText);
        throw new Error(
          `Weather forecast agent failed: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("API Response:", data);

      return {
        success: data.success || false,
        response: data.response || null,
        error: data.error || null,
      };
    } catch (error) {
      console.error("Error calling weather forecast agent:", error);
      throw new Error(
        `Failed to get weather forecast response: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // New method for pest prediction agent mode
  async getPestPredictionAgent(
    request: PestPredictionAgentRequest
  ): Promise<PestPredictionAgentResponse> {
    try {
      console.log("=== PEST PREDICTION AGENT DEBUG ===");
      console.log("Query:", request.query);
      if (request.imageFile) {
        console.log(
          "Image file:",
          request.imageFile.name,
          request.imageFile.size
        );
      }

      // Use the existing predictPest method
      const result = await this.predictPest(request.query, request.imageFile);

      console.log("Pest prediction result:", result);

      return {
        success: result.success,
        possible_pest_names: result.possible_pest_names,
        description: result.description,
        pesticide_recommendation: result.pesticide_recommendation,
        error: result.error,
      };
    } catch (error) {
      console.error("Error calling pest prediction agent:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // New method for crop disease detection agent mode
  async getCropDiseaseDetectionAgent(
    request: CropDiseaseDetectionAgentRequest
  ): Promise<CropDiseaseDetectionAgentResponse> {
    try {
      console.log("=== CROP DISEASE DETECTION AGENT DEBUG ===");

      if (request.imageFile) {
        console.log(
          "Image file:",
          request.imageFile.name,
          request.imageFile.size
        );
      } else {
        console.log("No image file provided - using text-only analysis");
      }

      if (request.query) {
        console.log("Query:", request.query);
      }

      const formData = new FormData();

      // Only append image if provided
      if (request.imageFile) {
        formData.append("image", request.imageFile);
      }

      // Always append query parameter (defaults to "describe the diseases" if not provided)
      formData.append("query", request.query || "describe the diseases");

      const response = await fetch(
        `${config.apiUrl}/api/v1/cropdisease/detect`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: CropDiseaseDetectionResponse = await response.json();

      console.log("Crop disease detection result:", result);

      return {
        success: result.success,
        diseases: result.diseases,
        disease_probabilities: result.disease_probabilities,
        symptoms: result.symptoms,
        Treatments: result.Treatments,
        prevention_tips: result.prevention_tips,
        image_path: result.image_path,
        error: result.error,
      };
    } catch (error) {
      console.error("Error calling crop disease detection agent:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // New method for market price agent mode
  async getMarketPriceAgent(
    request: MarketPriceAgentRequest
  ): Promise<MarketPriceAgentResponse> {
    try {
      console.log("=== MARKET PRICE AGENT DEBUG ===");
      console.log("Query:", request.query);

      const response = await fetch(
        `${this.baseUrl}/api/v1/marketprice/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: request.query,
          }),
        }
      );

      console.log("Response Status:", response.status);
      console.log("Response OK:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error Response Body:", errorText);
        throw new Error(
          `Market price agent failed: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("API Response:", data);

      return {
        success: data.success || false,
        response: data.response || null,
        error: data.error || null,
      };
    } catch (error) {
      console.error("Error calling market price agent:", error);
      throw new Error(
        `Failed to get market price response: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // New method for risk management agent mode
  async getRiskManagementAgent(
    request: RiskManagementAgentRequest
  ): Promise<RiskManagementAgentResponse> {
    try {
      console.log("=== RISK MANAGEMENT AGENT DEBUG ===");
      console.log("Query:", request.query);

      const response = await fetch(`${this.baseUrl}/api/v1/risk/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: request.query,
        }),
      });

      console.log("Response Status:", response.status);
      console.log("Response OK:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error Response Body:", errorText);
        throw new Error(
          `Risk management agent failed: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("API Response:", data);

      return {
        success: data.success || false,
        risk_analysis: data.risk_analysis || null,
        recommendations: data.recommendations || null,
        timestamp: data.timestamp || null,
        error: data.error || null,
      };
    } catch (error) {
      console.error("Error calling risk management agent:", error);
      throw new Error(
        `Failed to get risk management response: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // New method for workflow agent mode (generic multilingual agent)
  async getWorkflowAgent(
    request: WorkflowAgentRequest
  ): Promise<WorkflowAgentResponse> {
    try {
      console.log("=== WORKFLOW AGENT DEBUG ===");
      console.log("Query:", request.query);
      console.log("Mode:", request.mode);
      console.log("Has Image:", !!request.image);

      let response;

      if (request.image) {
        // Use the image endpoint for queries with images
        const formData = new FormData();
        formData.append("query", request.query);
        formData.append("image", request.image);

        response = await fetch(
          `${this.baseUrl}/api/v1/workflow/process-with-image`,
          {
            method: "POST",
            body: formData,
          }
        );
      } else {
        // Use the regular endpoint for text-only queries
        response = await fetch(`${this.baseUrl}/api/v1/workflow/process`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: request.query,
            mode: "tooling",
          }),
        });
      }

      console.log("Response Status:", response.status);
      console.log("Response OK:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error Response Body:", errorText);
        throw new Error(
          `Workflow agent failed: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("API Response:", data);

      return {
        success: true,
        response: data.answer || data.response || null,
        answer: data.answer || data.response || null,
        answer_quality_grade: data.answer_quality_grade || null,
        is_answer_complete: data.is_answer_complete || null,
        final_mode: data.final_mode || null,
        switched_modes: data.switched_modes || null,
        is_image_query: data.is_image_query || null,
        chart_path: data.chart_path || null,
        chart_extra_message: data.chart_extra_message || null,
        processing_time: data.processing_time || null,
        error: data.error || null,
      };
    } catch (error) {
      console.error("Error calling workflow agent:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // New method for crop yield agent mode
  async getCropYieldAgent(
    request: CropYieldAgentRequest
  ): Promise<CropYieldAgentResponse> {
    try {
      console.log("=== CROP YIELD AGENT DEBUG ===");
      console.log("Query:", request.query);

      const response = await fetch(`${config.apiUrl}/api/v1/agent/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: request.query,
        }),
      });

      console.log("Response Status:", response.status);
      console.log("Response OK:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error Response Body:", errorText);
        throw new Error(
          `Crop yield agent failed: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("API Response:", data);

      return {
        success: true,
        result: data.result || null,
        error: data.error || null,
      };
    } catch (error) {
      console.error("Error calling crop yield agent:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // New method for credit policy market agent mode
  async getCreditPolicyMarketAgent(
    request: CreditPolicyMarketAgentRequest
  ): Promise<CreditPolicyMarketAgentResponse> {
    try {
      console.log("=== CREDIT POLICY MARKET AGENT DEBUG ===");
      console.log("Query:", request.query);

      const response = await fetch(
        `${config.apiUrl}/api/v1/creditpolicy/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: request.query,
          }),
        }
      );

      console.log("Response Status:", response.status);
      console.log("Response OK:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error Response Body:", errorText);
        throw new Error(
          `Credit policy market agent failed: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("API Response:", data);

      return {
        success: data.success || false,
        response: data.response || null,
        error: data.error || null,
      };
    } catch (error) {
      console.error("Error calling credit policy market agent:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
export const agriculturalAPI = new AgriculturalAPIService();

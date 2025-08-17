export interface AgricultureAgent {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category:
    | "prediction"
    | "advisory"
    | "analysis"
    | "market"
    | "news"
    | "research";
  color: string;
  mode?: "tool" | "agent" | "both";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachments?: FileAttachment[];
  language?: string;
  translations?: Record<string, string>;
  metadata?: {
    confidence?: number;
    sources?: string[];
    agent_type?: string;
    // Crop recommendation agent specific data
    crop_names?: string[];
    confidence_scores?: number[];
    justifications?: string[];
    // Weather forecast agent specific data
    success?: boolean;
    error?: string;
    // Pest prediction agent specific data
    possible_pest_names?: string[];
    description?: string;
    pesticide_recommendation?: string;
    // Crop disease detection agent specific data
    diseases?: string[];
    disease_probabilities?: number[];
    symptoms?: string[];
    treatments?: string[];
    prevention_tips?: string[];
  };
  error?: boolean;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: "image" | "pdf";
  url: string;
  size: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  agent?: AgricultureAgent;
  createdAt: Date;
  updatedAt: Date;
  language: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  voiceCode?: string;
}

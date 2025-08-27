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
    // Crop yield agent specific data
    result?: string;
    // Credit policy market agent specific data
    response?: string;
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
    has_image?: boolean;
    // Risk management agent specific data
    risk_analysis?: any;
    recommendations?: string[];
    timestamp?: string;
    // Workflow agent specific data
    answer_quality_grade?: any;
    processing_time?: number;
    mode?: "rag" | "tooling";
    chart_path?: string;
    chart_extra_message?: string;
    is_answer_complete?: boolean;
    final_mode?: string;
    switched_modes?: boolean;
    is_image_query?: boolean;
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

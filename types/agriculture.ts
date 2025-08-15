export interface AgricultureAgent {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: "prediction" | "advisory" | "analysis" | "market" | "news";
  color: string;
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

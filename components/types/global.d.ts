export {};

type SpeechRecognitionConstructor = new () => SpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onaudioend: (() => void) | null;
    onaudiostart: (() => void) | null;
    onend: (() => void) | null;
    onerror: ((event: any) => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onstart: (() => void) | null;
  }

  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
  }
}

export interface FarmerProfile {
  fullName: string;
  location: string;
  landHoldings: number;
  crops: string[];
  preferredLanguage: string;
}

export interface Crop {
  id: string;
  name: string;
  emoji: string;
  category: string;
}

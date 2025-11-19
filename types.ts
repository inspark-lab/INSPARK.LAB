
export interface NewsSource {
  id: string;
  name: string;
  url: string;
}

export interface Article {
  id: string;
  title: string;
  source: string;
  url: string;
  imageUrl: string;
  publishedAt: string;
  snippet?: string;
}

export interface ZoneSource {
  name: string;
  url: string;
}

export interface NewsZone {
  id: string;
  title: string;
  sources: ZoneSource[]; // Changed from queries: string[]
  lastUpdated?: number;
  summary?: string;
  articles?: GroundingChunk[];
  isLoading?: boolean;
  error?: string;
}

// Derived from Gemini GroundingMetadata structure
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface NotificationSettings {
  enabled: boolean;
  email: string;
  time: string; // "08:00"
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

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
}

export interface ZoneSource {
  name: string;
  url: string;
}

// Derived from Gemini GroundingMetadata structure
// Extended with 'meta' to carry RSS specific data through the app
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  meta?: {
    imageUrl?: string;
    sourceName?: string;
    publishedAt?: string;
    description?: string;
  };
}

export interface ZoneContentResponse {
  text: string;
  chunks: GroundingChunk[];
}

export interface NewsZone {
  id: string;
  title: string;
  sources: ZoneSource[]; 
  lastUpdated?: number;
  summary?: string;
  articles?: GroundingChunk[];
  isLoading?: boolean;
  error?: string;
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
export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface UserPayload {
  id: string;
  email: string;
}

export interface PodcastConfig {
  prompt: string;
  style: string; 
  duration: number;  
  language: string;
}
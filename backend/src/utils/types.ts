/**
 * Shared TypeScript types for backend
 */

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface UserPayload {
  id: string;
  email: string;
}

export interface GeneratePodcastRequest {
  prompt: string;
  style: string; 
  duration: number;  
  language: string;
}
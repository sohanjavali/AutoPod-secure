/**
 * episode.model.ts
 * - Type definitions for an Episode/Podcast record stored in Supabase
 */

export interface PodcastRecord {
  id?: string; // Supabase will typically provide this after insert
  prompt: string;
  script: string;
  audioUrl: string;
  createdAt?: string;
  meta?: Record<string, unknown>;
}

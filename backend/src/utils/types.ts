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
}

export interface ValidateResult {
  isValid: boolean;
  reason: string;
  sanitizedTopic: string;
}

export interface ResearchResult {
  topic: string;
  duration: number;
  style: string;
  language: string;
  discussionPoints: {
    title: string;
    facts: string[];
    perspectives: string[];
    questions: string[];
  }[];
  citations: string[];
}

export interface Voice {
  persona: string;
  id: string;
}

export type Voices = Record<string, Voice>;

export interface ScriptLine {
  lineNum: number;
  speaker: string;
  text: string;
  emotion: string;
}

export interface PodcastTranscript {
  title: string;
  description: string;
  script: ScriptLine[];
}


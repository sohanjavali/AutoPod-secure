/**
 * research.service.ts
 * - Responsible for researching a prompt using an LLM (e.g., Claude)
 * - Exports a function that accepts a prompt and returns structured research notes
 */

import type { GeneratePodcastRequest } from "../utils/types.ts";
import Anthropic from "@anthropic-ai/sdk";

export interface ResearchResult {
  summary: string;
  sources?: string[];
}

export async function researchPrompt(promptContext: GeneratePodcastRequest): Promise<ResearchResult> {}

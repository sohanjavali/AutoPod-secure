/**
 * research.service.ts
 * - Responsible for researching a prompt using an LLM (e.g., Claude)
 * - Exports a function that accepts a prompt and returns structured research notes
 */

export interface ResearchResult {
  summary: string;
  sources?: string[];
}

export async function researchPrompt(prompt: string): Promise<ResearchResult> {
  // TODO: call Claude (or other research APIs) to gather background/context for the prompt
  throw new Error("researchPrompt not implemented");
}

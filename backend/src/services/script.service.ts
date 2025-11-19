/**
 * script.service.ts
 * - Takes a prompt + research notes and generates a structured podcast script
 * - Expected output format: sections, host dialogue, transitions, timestamps, etc.
 */

export interface ScriptResult {
  script: string;
  sections?: Array<{ title: string; content: string }>; 
}

export async function generateScript(prompt: string, researchNotes: string): Promise<ScriptResult> {
  // TODO: call LLM (Claude) to create a structured script for the podcast
  throw new Error("generateScript not implemented");
}

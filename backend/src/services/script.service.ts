/**
 * script.service.ts
 * - Generates structured podcast script using Claude structured outputs
 * - Same format as research.service.ts
 */

import type { PodcastConfig } from "../utils/types.ts";
import { anthropicClient } from "../lib/anthropic.ts";
import { buildScriptPrompt } from "../utils/prompts.ts";

export interface Voice {
  name: string;
  persona: string;
}

export interface ScriptLine {
  lineNum: number;
  speaker: string;
  text: string;
  emotion: string;
}

export interface ScriptResult {
  title: string;
  description: string;
  voices: Voice[];
  script: ScriptLine[];
}

export async function generateScript(
promptContext: PodcastConfig,
  researchNotes: string
): Promise<ScriptResult> {
  const maxTokens = promptContext.duration === 10 ? 9000 : 15000;

  const response = await anthropicClient.beta.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: maxTokens,
    betas: ["structured-outputs-2025-11-13"],
    system: [
      {
        type: "text",
        text: "You are a professional podcast script writer."
      }
    ],
    messages: [
      {
        role: "user",
        content: buildScriptPrompt(promptContext, researchNotes)
      }
    ],
    output_format: {
      type: "json_schema",
      schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          voices: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                persona: { type: "string" }
              },
              required: ["name", "persona"],
              additionalProperties: false
            }
          },
          script: {
            type: "array",
            items: {
              type: "object",
              properties: {
                lineNum: { type: "number" },
                speaker: { type: "string" },
                text: { type: "string" },
                emotion: { type: "string" }
              },
              required: ["lineNum", "speaker", "text", "emotion"],
              additionalProperties: false
            }
          }
        },
        required: ["title", "description", "voices", "script"],
        additionalProperties: false
      }
    }
  });

  const text = (response?.content?.[0] as any)?.text;

  if (typeof text !== "string") {
    return text as ScriptResult;
  }

  return JSON.parse(text) as ScriptResult;
}

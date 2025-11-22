/**
 * script.service.ts
 * - Generates structured podcast script using Claude structured outputs
 * - Same format as research.service.ts
 */

import type { PodcastConfig } from "../utils/types.ts";
import { anthropicClient } from "../lib/anthropic.ts";
import { buildScriptPrompt } from "../utils/prompts.ts";
import type { PodcastEpisode } from "../utils/types.ts";
import { voices } from "../lib/cartesia.ts";

export async function generateScript(
promptContext: PodcastConfig,
  researchNotes: string
): Promise<PodcastEpisode> {
  const maxTokens = promptContext.duration === 5 ? 4000 : 7000;

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
        content: buildScriptPrompt(promptContext, researchNotes, voices)
      }
    ],
    output_format: {
      type: "json_schema",
      schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
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
    return text as PodcastEpisode;
  }

  return JSON.parse(text) as PodcastEpisode;
}

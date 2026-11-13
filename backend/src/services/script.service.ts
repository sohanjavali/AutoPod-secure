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
import { ALLOWED_EMOTIONS, ALLOWED_SPEAKERS } from "../guardrails/output.ts";
import { extractJson } from "./llm-response.ts";

export async function generateScript(
  promptContext: PodcastConfig,
  researchNotes: string
): Promise<PodcastEpisode> {
  // Determine max tokens based on podcast duration
  const maxTokens = promptContext.duration === 5 ? 4000 : 7000;

  const { system, user } = buildScriptPrompt(promptContext, researchNotes, voices);

  // Call the Anthropic API to generate the podcast script in JSON format
  const response = await anthropicClient.beta.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: maxTokens,
    betas: ["structured-outputs-2025-11-13"],
    system: [{ type: "text", text: system }],
    messages: [
      {
        role: "user",
        content: user
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
                speaker: { type: "string", enum: [...ALLOWED_SPEAKERS] },
                text: { type: "string" },
                emotion: { type: "string", enum: [...ALLOWED_EMOTIONS] }
              },
              required: ["lineNum", "speaker", "text", "emotion"],
              additionalProperties: false
            }
          }
        },
        required: ["title", "description", "script"],
        additionalProperties: false
      }
    }
  });

  // Shape is validated downstream by parseEpisode
  return extractJson(response, "script") as PodcastEpisode;
}

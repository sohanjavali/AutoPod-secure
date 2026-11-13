/**
 * research.service.ts
 * - Responsible for researching a prompt using an LLM (e.g., Claude)
 * - Exports a function that accepts a prompt and returns structured research notes
 */

import type { PodcastConfig } from "../utils/types.ts";
import { anthropicClient } from "../lib/anthropic.ts";
import { buildResearchPrompt } from "../utils/prompts.ts";
import type { ResearchResult } from "../utils/types.ts";
import { extractJson } from "./llm-response.ts";
import { PIPELINE_MODEL } from "../lib/models.ts";

export async function researchPrompt(promptContext: PodcastConfig): Promise<ResearchResult> {
  // Determine max tokens based on podcast duration
  const maxTokens = promptContext.duration === 5 ? 2000 : 4000;
  
  const { system, user } = buildResearchPrompt(promptContext);

  // Call the Anthropic API to get research notes in JSON format
  const response = await anthropicClient.beta.messages.create({
    model: PIPELINE_MODEL,
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
          topic: { type: "string" },
          duration: { type: "number" },
          style: { type: "string" },
          language: { type: "string" },
          discussionPoints: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                facts: {
                  type: "array",
                  items: { type: "string" }
                },
                perspectives: {
                  type: "array",
                  items: { type: "string" }
                },
                questions: {
                  type: "array",
                  items: { type: "string" }
                }
              },
              required: ["title", "facts", "perspectives", "questions"],
              additionalProperties: false
            }
          },
          citations: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["topic", "duration", "style", "language", "discussionPoints", "citations"],
        additionalProperties: false
      }
    }
  });

  // Shape is validated downstream by parseResearch
  return extractJson(response, "research") as ResearchResult;
}

/**
 * research.service.ts
 * - Responsible for researching a prompt using an LLM (e.g., Claude)
 * - Exports a function that accepts a prompt and returns structured research notes
 */

import type { PodcastConfig } from "../utils/types.ts";
import { anthropicClient } from "../lib/anthropic.ts";
import { buildResearchPrompt } from "../utils/prompts.ts";
import type { ResearchResult } from "../utils/types.ts";

export async function researchPrompt(promptContext: PodcastConfig): Promise<ResearchResult> {
  const maxTokens = promptContext.duration === 5 ? 1500 : 2500;
  
  const response = await anthropicClient.beta.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: maxTokens,
    betas: ["structured-outputs-2025-11-13"],
    system: [
      {
        type: "text",
        text: "You are an research assistant tasked with producing research notes for a podcast."
      }
    ],
    messages: [
      {
        role: "user",
        content: buildResearchPrompt(promptContext)
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

  const text = (response?.content?.[0] as any)?.text;

  // If the SDK already provided a parsed object, return it directly
  if (typeof text !== "string") {
    return text as ResearchResult;
  }

  // Otherwise return a parsed JSON string
  return JSON.parse(text) as ResearchResult;
}

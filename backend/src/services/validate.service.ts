import { anthropicClient } from "../lib/anthropic.ts";
import { buildValidatePrompt } from "../utils/prompts.ts";

export interface ValidateResult {
  isValid: boolean;
  reason: string;
  sanitizedTopic: string;
}

export async function validatePrompt(prompt: string): Promise<ValidateResult> {
  const response = await anthropicClient.beta.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 150,
    betas: ["structured-outputs-2025-11-13"],
    system: [
      {
        type: "text",
        text: "You are a content safety and feasibility evaluator."
      }
    ],
    messages: [
      {
        role: "user",
        content: buildValidatePrompt(prompt)
      }
    ],
    output_format: {
      type: "json_schema",
      schema: {
        type: "object",
        properties: {
          isValid: { type: "boolean" },
          reason: { type: "string" },
          sanitizedTopic: { type: "string" }
        },
        required: ["isValid", "reason", "sanitizedTopic"],
        additionalProperties: false
      }
    }
  });

  // Extract the text field which may be a JSON string
  const text = (response?.content?.[0] as any)?.text;

  // If the SDK already provided a parsed object, return it directly
  if (typeof text !== "string") {
    return text as ValidateResult;
  }

  // Otherwise return a parsed JSON string
  return JSON.parse(text) as ValidateResult;
}
import { z } from "zod";
import { anthropicClient } from "../lib/anthropic.ts";
import { buildValidatePrompt } from "../utils/prompts.ts";
import type { ValidateResult } from "../utils/types.ts";
import { PIPELINE_MODEL } from "../lib/models.ts";

const ValidateSchema = z.object({
  isValid: z.boolean(),
  reason: z.string().max(300),
  sanitizedTopic: z.string().trim().min(3).max(300),
});

const FALLBACK: ValidateResult = { isValid: false, reason: "Could not validate topic", sanitizedTopic: "" };

export async function validatePrompt(prompt: string): Promise<ValidateResult> {
  const { system, user } = buildValidatePrompt(prompt);

  // Call the Anthropic API to validate the prompt
  const response = await anthropicClient.beta.messages.create({
    model: PIPELINE_MODEL,
    max_tokens: 150,
    betas: ["structured-outputs-2025-11-13"],
    system: [{ type: "text", text: system }],
    messages: [{ role: "user", content: user }],
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

  if (response.stop_reason === "refusal" || response.stop_reason === "max_tokens") return FALLBACK;

  const block = (response.content as { type?: string; text?: unknown }[]).find((b) => b?.type === "text");
  let raw: unknown = block?.text;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return FALLBACK;
    }
  }

  // The model-produced sanitizedTopic is untrusted: enforce shape and length. A rejected topic
  // legitimately has an empty sanitizedTopic, so only enforce the 3-300 bound when isValid.
  const loose = z.object({ isValid: z.boolean(), reason: z.string().max(300), sanitizedTopic: z.string() }).safeParse(raw);
  if (loose.success && !loose.data.isValid) {
    return { isValid: false, reason: loose.data.reason, sanitizedTopic: "" };
  }
  const parsed = ValidateSchema.safeParse(raw);
  return parsed.success ? parsed.data : FALLBACK;
}

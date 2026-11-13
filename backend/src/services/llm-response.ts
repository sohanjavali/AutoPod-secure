import { GuardrailError } from "../guardrails/errors.ts";

// Pulls the JSON payload out of a structured-output response, refusing garbage.
export function extractJson(
  response: { stop_reason?: string | null; content?: unknown },
  stage: "research" | "script"
): unknown {
  if (response.stop_reason === "refusal") {
    throw new GuardrailError("OUTPUT_REJECTED", stage, `Model refused during ${stage}`);
  }
  if (response.stop_reason === "max_tokens") {
    throw new Error(`LLM output truncated (max_tokens) during ${stage}`);
  }
  const blocks = Array.isArray(response.content) ? (response.content as { type?: string; text?: unknown }[]) : [];
  const text = blocks.find((b) => b?.type === "text")?.text;
  if (typeof text !== "string") {
    if (text && typeof text === "object") return text;
    throw new Error(`LLM returned no text content during ${stage}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`LLM returned unparseable JSON during ${stage}`);
  }
}

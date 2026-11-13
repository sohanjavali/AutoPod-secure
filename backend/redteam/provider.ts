import { GenerateBodySchema } from "../src/schemas/podcast.schema.ts";
import { validatePrompt } from "../src/services/validate.service.ts";
import { generateEpisode } from "../src/services/pipeline.service.ts";
import { GuardrailError } from "../src/guardrails/errors.ts";
import { classifyInjection, INJECTION_BLOCK_THRESHOLD } from "../src/guardrails/injection.ts";

// Mirrors the real request path in-process: schema -> validatePrompt -> generateEpisode.
// No TTS, no JWT. Run from backend/ so the app's own env loading works from cwd.
export default class AutoPodProvider {
  id() {
    return "autopod-pipeline";
  }

  async callApi(_prompt: string, context?: { vars?: Record<string, unknown> }) {
    const vars = context?.vars ?? {};
    const body = { prompt: vars.topic, style: vars.style, duration: vars.duration };

    const parsed = GenerateBodySchema.safeParse(body);
    if (!parsed.success) {
      const detail = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return { output: JSON.stringify({ blocked: true, layer: "schema", detail }) };
    }

    // Cheap mode: schema, then ONE claude-haiku-4-5 classifier call. No validate/research/script.
    if (process.env.REDTEAM_MODE === "classifier") {
      try {
        const c = await classifyInjection(parsed.data.prompt, "topic");
        const blocked = c.isInjection && c.confidence >= INJECTION_BLOCK_THRESHOLD;
        return { output: JSON.stringify({ blocked, layer: "classifier", confidence: c.confidence }) };
      } catch (err) {
        // classifyInjection fails closed on topics by throwing GuardrailError
        if (err instanceof GuardrailError) {
          return { output: JSON.stringify({ blocked: true, layer: "classifier", code: err.code, stage: err.stage }) };
        }
        return { error: err instanceof Error ? err.message : String(err) };
      }
    }

    try {
      const v = await validatePrompt(parsed.data.prompt);
      if (!v.isValid) {
        return { output: JSON.stringify({ blocked: true, layer: "validate", detail: v.reason }) };
      }

      const episode = await generateEpisode({
        topic: v.sanitizedTopic,
        style: parsed.data.style,
        duration: parsed.data.duration,
      });
      return { output: JSON.stringify({ blocked: false, episode }) };
    } catch (err) {
      if (err instanceof GuardrailError) {
        return {
          output: JSON.stringify({ blocked: true, layer: "guardrail", code: err.code, stage: err.stage }),
        };
      }
      return { error: err instanceof Error ? err.message : String(err) };
    }
  }
}

import { classifyInjection, INJECTION_BLOCK_THRESHOLD } from "../guardrails/injection.ts";
import { GuardrailError } from "../guardrails/errors.ts";
import { assertSafeForTTS, parseEpisode, parseResearch } from "../guardrails/output.ts";
import type { Style } from "../schemas/podcast.schema.ts";
import type { PodcastEpisode } from "../utils/types.ts";
import { researchPrompt } from "./research.service.ts";
import { generateScript } from "./script.service.ts";
import { clip, hashPrompt } from "../lib/logger.ts";
import { timed } from "../lib/stepLog.ts";

const STYLES: readonly string[] = ["conversational", "educational", "entertaining", "professional"];

export async function generateEpisode(input: {
  topic: string;
  style: Style;
  duration: 5 | 10;
}): Promise<PodcastEpisode> {
  const { topic, style, duration } = input;
  // Defence in depth: the route schema already checks these.
  if (!STYLES.includes(style)) throw new Error("Invalid style");
  if (duration !== 5 && duration !== 10) throw new Error("Invalid duration");

  const base = { promptHash: hashPrompt(topic) };

  await timed("classify_topic", base, async (ctx) => {
    const v = await classifyInjection(topic, "topic");
    ctx.extra.confidence = v.confidence;
    ctx.extra.isInjection = v.isInjection;
    if (v.isInjection && v.confidence >= INJECTION_BLOCK_THRESHOLD) {
      ctx.extra.reason = clip(v.reason);
      throw new GuardrailError("INJECTION_DETECTED", "topic", `Topic flagged: ${v.reason}`);
    }
  });

  const config = { prompt: topic, style, duration };
  const research = await timed("research", base, async () => parseResearch(await researchPrompt(config)));

  const notes = JSON.stringify(research);
  await timed("classify_research", base, async (ctx) => {
    const v = await classifyInjection(notes, "research");
    ctx.extra.confidence = v.confidence;
    ctx.extra.isInjection = v.isInjection;
    if (v.isInjection && v.confidence >= INJECTION_BLOCK_THRESHOLD) {
      ctx.extra.reason = clip(v.reason);
      throw new GuardrailError("INJECTION_DETECTED", "research", `Research flagged: ${v.reason}`);
    }
  });

  const rawScript = await timed("script", base, () => generateScript(config, notes));

  const episode = await timed("output_validation", base, (ctx) => {
    const ep = parseEpisode(rawScript, duration);
    ctx.extra.lineCount = ep.script.length;
    return ep;
  });

  await timed("tts_safety", base, () => assertSafeForTTS(episode));
  return episode;
}

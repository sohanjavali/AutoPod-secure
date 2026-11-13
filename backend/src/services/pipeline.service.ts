import { classifyInjection, INJECTION_BLOCK_THRESHOLD } from "../guardrails/injection.ts";
import { GuardrailError } from "../guardrails/errors.ts";
import { assertSafeForTTS, parseEpisode, parseResearch } from "../guardrails/output.ts";
import type { Style } from "../schemas/podcast.schema.ts";
import type { PodcastEpisode } from "../utils/types.ts";
import { researchPrompt } from "./research.service.ts";
import { generateScript } from "./script.service.ts";

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

  const topicVerdict = await classifyInjection(topic, "topic");
  if (topicVerdict.isInjection && topicVerdict.confidence >= INJECTION_BLOCK_THRESHOLD) {
    throw new GuardrailError("INJECTION_DETECTED", "topic", `Topic flagged: ${topicVerdict.reason}`);
  }

  const config = { prompt: topic, style, duration };
  const research = parseResearch(await researchPrompt(config));

  const notes = JSON.stringify(research);
  const researchVerdict = await classifyInjection(notes, "research");
  if (researchVerdict.isInjection && researchVerdict.confidence >= INJECTION_BLOCK_THRESHOLD) {
    throw new GuardrailError("INJECTION_DETECTED", "research", `Research flagged: ${researchVerdict.reason}`);
  }

  const episode = parseEpisode(await generateScript(config, notes), duration);
  assertSafeForTTS(episode);
  return episode;
}

import { z } from "zod";
import { GuardrailError } from "./errors.ts";
import { CANARY_PHRASES } from "./canaries.ts";
import type { PodcastEpisode, ResearchResult } from "../utils/types.ts";

export { CANARY_PHRASES } from "./canaries.ts";

export const ALLOWED_SPEAKERS = ["Maya", "Leo", "Brandon", "Joanie", "Judith", "Kyle"] as const;

export const ALLOWED_EMOTIONS = [
  "happy", "excited", "enthusiastic", "elated", "euphoric", "triumphant", "amazed", "surprised",
  "flirtatious", "joking/comedic", "curious", "content", "peaceful", "serene", "calm", "grateful",
  "affectionate", "trust", "sympathetic", "anticipation", "mysterious", "angry", "mad", "outraged",
  "frustrated", "agitated", "threatened", "disgusted", "contempt", "envious", "sarcastic", "ironic",
  "sad", "dejected", "melancholic", "disappointed", "hurt", "guilty", "bored", "tired", "rejected",
  "nostalgic", "wistful", "apologetic", "hesitant", "insecure", "confused", "resigned", "anxious",
  "panicked", "alarmed", "scared", "neutral", "proud", "confident", "distant", "skeptical",
  "contemplative", "determined", "none",
] as const;

const speakerSchema = z
  .string()
  .transform((s) => s.trim())
  .transform((s) => ALLOWED_SPEAKERS.find((a) => a.toLowerCase() === s.toLowerCase()) ?? s)
  .pipe(z.enum(ALLOWED_SPEAKERS));

const emotionSchema = z
  .string()
  .transform((s) => s.trim().toLowerCase())
  .pipe(z.enum(ALLOWED_EMOTIONS));

const ResearchSchema = z.object({
  topic: z.string().max(500),
  duration: z.number(),
  style: z.string().max(50),
  language: z.string().max(50),
  discussionPoints: z
    .array(
      z.object({
        title: z.string().max(300),
        facts: z.array(z.string().max(800)).max(20),
        perspectives: z.array(z.string().max(800)).max(15),
        questions: z.array(z.string().max(500)).max(15),
      })
    )
    .min(1)
    .max(20),
  citations: z.array(z.string().max(500)).max(40),
});

const LINE_BOUNDS = { 5: { min: 10, max: 120 }, 10: { min: 20, max: 220 } } as const;

const EpisodeBase = z.object({
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().min(1).max(600),
  script: z.array(
    z.object({
      lineNum: z.number().int(),
      speaker: speakerSchema,
      text: z.string().trim().min(1).max(800),
      emotion: emotionSchema,
    })
  ),
});

function reject(stage: "research" | "script" | "pre_tts", detail: string): never {
  throw new GuardrailError("OUTPUT_REJECTED", stage, detail);
}

export function parseResearch(raw: unknown): ResearchResult {
  const r = ResearchSchema.safeParse(raw);
  if (!r.success) reject("research", `Research output failed validation: ${r.error.message}`);
  return r.data;
}

export function parseEpisode(raw: unknown, duration: 5 | 10): PodcastEpisode {
  const r = EpisodeBase.safeParse(raw);
  if (!r.success) reject("script", `Episode failed validation: ${r.error.message}`);
  const { min, max } = LINE_BOUNDS[duration];
  const n = r.data.script.length;
  if (n < min || n > max) reject("script", `Script has ${n} lines; expected ${min}-${max}`);
  // Prompt requires exactly 3 hosts; fewer is tolerated, more is not.
  const speakers = new Set(r.data.script.map((l) => l.speaker));
  if (speakers.size > 3) reject("script", `Script uses ${speakers.size} distinct speakers; max 3`);
  return r.data;
}

const LEAK_MARKERS = [
  "system prompt", "user_topic", "research_notes", "duration_minutes", "my instructions are",
  "<style", "</style",
];

const INSTRUCTION_PATTERNS: RegExp[] = [
  /\b(ignore|disregard|forget)\s+(all\s+|any\s+|the\s+|your\s+)?(previous|prior|above|earlier|preceding)\s+(instructions?|prompts?|rules)/i,
  /\bdisregard\b.{0,30}\binstructions?\b/i,
  /\byou are now (?:an? )?(?:ai\b|assistant|chatbot|language model|different|unrestricted|dan\b|in (?:developer|debug))/i,
  /\bas an ai (?:language )?model\b/i,
  /\b(?:reveal|print|repeat|show)\b.{0,20}\b(?:system|initial|hidden) (?:prompt|instructions?)/i,
  /\bnew instructions?\s*:/i,
];

function checkText(where: string, text: string): void {
  const lower = text.toLowerCase();
  for (const c of CANARY_PHRASES) {
    if (lower.includes(c)) reject("pre_tts", `Canary phrase leaked in ${where}`);
  }
  for (const m of LEAK_MARKERS) {
    if (lower.includes(m)) reject("pre_tts", `Prompt-structure leakage ("${m}") in ${where}`);
  }
  for (const p of INSTRUCTION_PATTERNS) {
    if (p.test(text)) reject("pre_tts", `Instruction-like pattern ${p} in ${where}`);
  }
}

export function assertSafeForTTS(episode: PodcastEpisode): void {
  checkText("title", episode.title);
  checkText("description", episode.description);
  for (const line of episode.script) checkText(`line ${line.lineNum}`, line.text);
}

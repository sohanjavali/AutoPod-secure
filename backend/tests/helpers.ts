import { ALLOWED_EMOTIONS, ALLOWED_SPEAKERS } from "../src/guardrails/output.ts";

export function makeEpisode(n: number, overrides: Record<string, unknown> = {}) {
  const speakers = ALLOWED_SPEAKERS.slice(0, 3);
  return {
    title: "A Fine Episode",
    description: "A short description of the episode.",
    script: Array.from({ length: n }, (_, i) => ({
      lineNum: i + 1,
      speaker: speakers[i % 3]!,
      text: `Line number ${i + 1} of normal dialogue.`,
      emotion: ALLOWED_EMOTIONS[i % 3]!,
    })),
    ...overrides,
  };
}

export function makeResearch() {
  return {
    topic: "Bees",
    duration: 5,
    style: "conversational",
    language: "English",
    discussionPoints: [{ title: "Hives", facts: ["Bees make honey."], perspectives: ["Farmers rely on them."], questions: ["Why?"] }],
    citations: ["Some Book"],
  };
}

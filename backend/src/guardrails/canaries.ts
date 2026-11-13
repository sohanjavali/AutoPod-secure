// Distinctive markers embedded in system prompts. They must never appear in model output;
// if one does, the system prompt leaked and the episode is rejected before TTS.
export const CANARY_PHRASES = [
  "zephyr-quartz-7f3a91c2",
  "ember-lattice-b84d05e7",
] as const;

export const CANARY_RESEARCH = CANARY_PHRASES[0];
export const CANARY_SCRIPT = CANARY_PHRASES[1];

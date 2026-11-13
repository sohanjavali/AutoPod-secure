export type GuardrailCode = "INJECTION_DETECTED" | "OUTPUT_REJECTED";
export type GuardrailStage = "topic" | "research" | "script" | "pre_tts";

export class GuardrailError extends Error {
  code: GuardrailCode;
  stage: GuardrailStage;
  publicMessage: string;

  // `message` holds internal detail (logs only); `publicMessage` is the generic text safe to show users.
  constructor(code: GuardrailCode, stage: GuardrailStage, message: string, publicMessage?: string) {
    super(message);
    this.name = "GuardrailError";
    this.code = code;
    this.stage = stage;
    this.publicMessage =
      publicMessage ??
      (code === "INJECTION_DETECTED"
        ? "This topic can't be used to generate a podcast. Please try a different one."
        : "We couldn't generate a valid episode this time. Please try again.");
  }
}

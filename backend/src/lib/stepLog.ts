import { GuardrailError } from "../guardrails/errors.ts";
import { clip } from "./logger.ts";
import { getLog } from "./requestContext.ts";

export type SecurityEventType =
  | "injection_blocked"
  | "output_guardrail_blocked"
  | "topic_rejected"
  | "auth_failed"
  | "rate_limited";

export type StepFields = Record<string, unknown>;

export function securityEvent(type: SecurityEventType, fields: StepFields = {}): void {
  getLog().warn({ event: "security_event", type, ...fields });
}

export interface StepCtx {
  // Extra non-sensitive fields merged into the step line (and any security event).
  extra: StepFields;
  // Mark the step as blocked without throwing (e.g. validatePrompt returns isValid false).
  markBlocked(): void;
}

// Runs fn and emits one "pipeline_step" line with duration + outcome. GuardrailError => blocked
// (plus a security_event); other errors => error (name/message only). Always rethrows.
export async function timed<T>(step: string, base: StepFields, fn: (ctx: StepCtx) => Promise<T> | T): Promise<T> {
  const start = performance.now();
  const extra: StepFields = {};
  let blocked = false;
  const ctx: StepCtx = { extra, markBlocked: () => { blocked = true; } };
  const emit = (outcome: "ok" | "blocked" | "error", more: StepFields = {}) => {
    const line = { event: "pipeline_step", step, durationMs: Math.round(performance.now() - start), outcome, ...base, ...extra, ...more };
    const log = getLog();
    if (outcome === "error") log.error(line);
    else if (outcome === "blocked") log.warn(line);
    else log.info(line);
  };
  try {
    const result = await fn(ctx);
    emit(blocked ? "blocked" : "ok");
    return result;
  } catch (err) {
    if (err instanceof GuardrailError) {
      emit("blocked", { code: err.code, stage: err.stage });
      securityEvent(err.code === "INJECTION_DETECTED" ? "injection_blocked" : "output_guardrail_blocked", {
        stage: err.stage,
        code: err.code,
        ...base,
        ...extra,
      });
    } else {
      emit("error", { errorName: err instanceof Error ? err.name : "NonError", errorMessage: clip(err instanceof Error ? err.message : err) });
    }
    throw err;
  }
}

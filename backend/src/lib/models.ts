// Model used by the validate, research and script calls. One setting instead of
// three hard-coded IDs; override with CLAUDE_MODEL. The injection classifier
// pins its own model in guardrails/injection.ts.
export const PIPELINE_MODEL = process.env.CLAUDE_MODEL?.trim() || "claude-haiku-4-5";

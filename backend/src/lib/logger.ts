import { createHash } from "node:crypto";
import pino from "pino";

const REDACT_KEYS = ["token", "access_token", "apiKey", "api_key", "password", "authorization"];

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      'res.headers["set-cookie"]',
      ...REDACT_KEYS,
      ...REDACT_KEYS.map((k) => `*.${k}`),
    ],
    censor: "[Redacted]",
  },
});

// Short stable fingerprint so prompts can be correlated across log lines without being logged.
export function hashPrompt(text: string): string {
  return createHash("sha256").update(text).digest("hex").slice(0, 12);
}

// Truncate model/library-written strings before they reach the logs.
export function clip(s: unknown, max = 200): string {
  return String(s ?? "").slice(0, max);
}

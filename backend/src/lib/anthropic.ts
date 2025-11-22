import Anthropic from "@anthropic-ai/sdk";
import { env } from "../config/env.ts";

declare global {
  // Allow caching the client across module reloads
  var __anthropic_client__: Anthropic | undefined;
}

export const anthropicClient =
  global.__anthropic_client__ ??
  (global.__anthropic_client__ = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }));

export default anthropicClient;

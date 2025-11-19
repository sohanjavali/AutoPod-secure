/**
 * env.ts
 * Centralized environment configuration loader.
 *
 * This file will eventually read process.env and export a typed `Config` object
 * containing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CARTESIA_API_KEY, LLM keys, etc.
 *
 * For the scaffold we only expose the function signature and comments.
 */

export interface Config {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  CARTESIA_API_KEY?: string;
  LLM_API_KEY?: string;
  PORT?: number;
}

/**
 * loadConfig
 * - Should synchronously read and validate environment variables from process.env
 * - Should throw or return a result that indicates missing required variables
 */
export function loadConfig(): Config {
  // TODO: implement reading and validation
  throw new Error("loadConfig not implemented");
}

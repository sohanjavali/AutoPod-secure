import dotenv from "dotenv";

dotenv.config();

export interface Config {
  CARTESIA_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  PORT?: number;
  SUPABASE_URL?: string;
  SUPABASE_PUBLISHABLE_KEY?: string;
}

function loadConfig(): Config {
  const env = process.env;

  // Add missing required env vars to the list
  const missing: string[] = [];
  if (!env.CARTESIA_API_KEY) missing.push('CARTESIA_API_KEY');
  if (!env.ANTHROPIC_API_KEY) missing.push('ANTHROPIC_API_KEY');
  if (!env.PORT) missing.push('PORT');
  if (!env.SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!env.SUPABASE_PUBLISHABLE_KEY) missing.push('SUPABASE_PUBLISHABLE_KEY');

  if (missing.length > 0) throw new Error(`Missing required environment variables: ${missing.join(', ')}`);

  const result: Partial<Config> = {};

  // At this point the required env vars exist (non-empty string)
  if (env.CARTESIA_API_KEY) result.CARTESIA_API_KEY = env.CARTESIA_API_KEY;
  if (env.ANTHROPIC_API_KEY) result.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
  if (env.PORT) result.PORT = Number(env.PORT);
  if (env.SUPABASE_URL) result.SUPABASE_URL = env.SUPABASE_URL;
  if (env.SUPABASE_PUBLISHABLE_KEY) result.SUPABASE_PUBLISHABLE_KEY = env.SUPABASE_PUBLISHABLE_KEY;

  return result as Config;
}

export const env = loadConfig();
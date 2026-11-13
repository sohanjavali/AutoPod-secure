import type { User, SupabaseClient } from "@supabase/supabase-js";

// Per-request data attached by middleware (auth, body validation)
export interface AppLocals {
  user?: User;
  supabase?: SupabaseClient;
  body?: unknown;
}

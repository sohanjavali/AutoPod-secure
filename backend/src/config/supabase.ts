/**
 * supabase.ts
 * Responsible for creating and exporting Supabase admin client(s).
 *
 * Expected responsibilities (to implement later):
 * - Read SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from config
 * - Create an admin client with the service role key (server-only)
 * - Export typed helper functions for DB and Auth operations
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * getSupabaseAdmin
 * - Returns a SupabaseClient configured with the service role key.
 * - Signature only: implementation should create a client via createClient(url, key)
 */
export function getSupabaseAdmin(): SupabaseClient {
  // TODO: implement and return a real Supabase client
  throw new Error("getSupabaseAdmin not implemented");
}

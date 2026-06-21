import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-side admin client (service role — bypasses RLS; never import into client code).
let admin: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (admin) return admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) not set");
  admin = createClient(url, key, { auth: { persistSession: false } });
  return admin;
}

export const BLOB_BUCKET = "dcc-blobs";

/** True when the app should use the Supabase-backed repo (vs in-memory). */
export function useSupabase(): boolean {
  return process.env.USE_SUPABASE === "1" && !!process.env.NEXT_PUBLIC_SUPABASE_URL;
}

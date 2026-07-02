import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@tf-core/db";

import { supabaseUrl } from "./env";

const secretKey = process.env.SUPABASE_SECRET_KEY;

// Service-role client: bypasses RLS entirely. Reserved for the one class of
// operation that genuinely needs it — Supabase Auth admin API calls (e.g.
// creating a preparer/admin account, see actions/staff.ts) — never for
// general data access. Every regular query should go through
// lib/supabase/server.ts instead, so RLS stays the enforced boundary.
export function createServiceClient() {
  if (!secretKey) {
    throw new Error("Missing SUPABASE_SECRET_KEY. Copy .env.example to .env.local and fill it in.");
  }
  return createSupabaseClient<Database>(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

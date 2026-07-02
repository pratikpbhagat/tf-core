import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@tf-core/db";

import { supabasePublishableKey, supabaseUrl } from "./env";

// For public, unauthenticated reads only (services, filing_deadlines, the
// public tracker RPC). Deliberately does not touch cookies/headers, unlike
// lib/supabase/server.ts — that's what keeps pages using this client eligible
// for static generation (generateStaticParams, ISR). Using the cookie-aware
// server client here would silently opt these routes into dynamic rendering.
export function createPublicClient() {
  return createSupabaseClient<Database>(supabaseUrl, supabasePublishableKey);
}

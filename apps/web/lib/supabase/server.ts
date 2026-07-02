import { createServerClient } from "@supabase/ssr";
import type { Database } from "@tf-core/db";
import { cookies } from "next/headers";

import { supabasePublishableKey, supabaseUrl } from "./env";

// For use in Server Components, Server Actions, and Route Handlers. Not a
// singleton — call this per request so cookie handling stays request-scoped.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component render, which can't set cookies.
          // Safe to ignore as long as proxy.ts is refreshing the session.
        }
      },
    },
  });
}

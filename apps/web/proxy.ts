import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase/env";

// Next.js 16 renamed middleware.ts to proxy.ts (same request/response API).
// This does exactly two things, deliberately nothing more:
//   1. Refresh the Supabase session cookie on every request.
//   2. A coarse "no session at all -> /login" redirect for protected path
//      prefixes. It does NOT look up public.users.role — that DB round trip
//      happens once per request tree in each route group's layout.tsx
//      instead (see lib/auth/dal.ts), not on every single request here.
// RLS remains the actual security boundary; this is a UX convenience.
const PROTECTED_PREFIXES = ["/dashboard", "/preparer", "/admin"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtectedPath = PROTECTED_PREFIXES.some(
    (prefix) => request.nextUrl.pathname === prefix || request.nextUrl.pathname.startsWith(`${prefix}/`),
  );

  if (isProtectedPath && !user) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the query string too (e.g. ?service=itr-2 from the "Start
    // this filing" CTA) — a bare pathname would drop it and land the user
    // back on a page missing the context it needed.
    loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Skip static assets and image optimization requests.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

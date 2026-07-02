import "server-only";

import type { UserRole } from "@tf-core/db";
import { redirect } from "next/navigation";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

// Data Access Layer entry point: the one place that resolves "who is making
// this request." Memoized per request with React's cache() so every layout,
// page, and action calling this during the same render only hits the DB once.
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("id, name, email, role")
    .eq("id", user.id)
    .single();

  return profile ?? null;
});

export function dashboardPathForRole(role: UserRole): string {
  switch (role) {
    case "client":
      return "/dashboard";
    case "preparer":
      return "/preparer/dashboard";
    case "admin":
      return "/admin/dashboard";
  }
}

// Called from each protected route group's layout.tsx. Redirects to /login
// if there's no session, or to the caller's own dashboard if their role
// doesn't match — never renders the wrong role's UI for an authenticated
// user of a different role.
export async function requireRole(role: UserRole): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== role) {
    redirect(dashboardPathForRole(user.role));
  }

  return user;
}

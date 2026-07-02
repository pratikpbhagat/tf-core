"use server";

import { getSessionUser } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export type RevealPanState = { pan?: string; message?: string } | undefined;

// Thin wrapper around the get_full_pan() RPC (see functions_triggers.sql) —
// all the actual authorization (caller must be admin or the user themself)
// and audit logging happens inside that function, not here. PAN is never
// rendered by default anywhere in the UI; this is the one explicit,
// user-initiated path to see it.
export async function revealPan(_state: RevealPanState, formData: FormData): Promise<RevealPanState> {
  const user = await getSessionUser();
  if (!user) return { message: "Not authorized." };

  const userId = formData.get("userId");
  if (typeof userId !== "string" || userId.length === 0) return { message: "Invalid request." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_full_pan", { p_user_id: userId });

  if (error || !data) return { message: "PAN not on file, or you don't have access." };

  return { pan: data };
}

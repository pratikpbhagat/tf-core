"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import { getSessionUser } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

const SendMessageSchema = z.object({
  filingId: z.string().uuid(),
  message: z.string().trim().min(1, "Message can't be empty.").max(2000, "Message is too long."),
  isInternal: z.string().optional(),
});

export type SendMessageState = { message?: string } | undefined;

// Shared by client, preparer, and admin message forms. Clients can never
// post an internal note regardless of what's submitted — is_internal is
// forced false for them here, and RLS (messages_client_insert) backs that up
// independently.
export async function sendMessage(_state: SendMessageState, formData: FormData): Promise<SendMessageState> {
  const user = await getSessionUser();
  if (!user) return { message: "You must be signed in." };

  const validated = SendMessageSchema.safeParse({
    filingId: formData.get("filingId"),
    message: formData.get("message"),
    isInternal: formData.get("isInternal") || undefined,
  });
  if (!validated.success) {
    return { message: validated.error.flatten().fieldErrors.message?.[0] ?? "Invalid message." };
  }

  const isInternal = user.role !== "client" && validated.data.isInternal === "on";

  const supabase = await createClient();
  const { error } = await supabase.from("messages").insert({
    filing_id: validated.data.filingId,
    sender_id: user.id,
    message: validated.data.message,
    is_internal: isInternal,
  });

  if (error) return { message: "Could not send message. You may not have access to this filing." };

  revalidatePath(`/dashboard/filings/${validated.data.filingId}`);
  revalidatePath(`/preparer/filings/${validated.data.filingId}`);
  revalidatePath(`/admin/filings/${validated.data.filingId}`);
  return undefined;
}

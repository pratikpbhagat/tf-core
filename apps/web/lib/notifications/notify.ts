import "server-only";

import type { NotificationType } from "@tf-core/db";

import { createServiceClient } from "@/lib/supabase/service";

import { sendEmail } from "./email";

type NotifyInput = {
  filingId: string;
  type: NotificationType;
  to: string;
  subject: string;
  html: string;
  // Set only for repeatable reminders (deadline/e-verify) — notifications_log
  // has a unique (filing_id, dedupe_key) index, so a second call with the
  // same key is a no-op rather than a duplicate send. Event-triggered
  // notifications (filing created, status change, doc requested) don't need
  // one since they only ever fire once per actual event.
  dedupeKey?: string;
};

// Writes go through the service-role client deliberately: notifications_log
// has no INSERT policy for authenticated users (see rls_notifications.sql —
// "written exclusively by server-side code using the service role"), so this
// is the one place in the app that's supposed to bypass RLS for a write.
export async function notify({ filingId, type, to, subject, html, dedupeKey }: NotifyInput): Promise<boolean> {
  const supabase = createServiceClient();

  // Claim the dedupe slot before sending, not after — if this insert fails
  // on the unique constraint, a previous call already sent this exact
  // reminder, so skip sending again. This trades "guaranteed delivery on
  // logging failure" for "never double-send," which is the right default
  // for reminder emails triggered by a cron job that might re-run.
  const { error } = await supabase.from("notifications_log").insert({
    filing_id: filingId,
    type,
    sent_to: to,
    channel: "email",
    dedupe_key: dedupeKey ?? null,
  });

  if (error) {
    if (error.code !== "23505") {
      console.error("[notifications] failed to log notification", error);
    }
    return false;
  }

  const result = await sendEmail({ to, subject, html });
  if (!result.ok) {
    console.error("[notifications] send failed", result.error);
  }
  return result.ok;
}

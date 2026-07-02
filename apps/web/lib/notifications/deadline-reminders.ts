import "server-only";

import { daysUntil } from "@/lib/filings/deadline";
import { TERMINAL_FILING_STATUSES } from "@/lib/filings/status";
import { createServiceClient } from "@/lib/supabase/service";

import { notify } from "./notify";

const REMINDER_THRESHOLDS = [30, 15, 7, 1];

export type DeadlineReminderResult = {
  filingsScanned: number;
  deadlineRemindersSent: number;
  eVerifyRemindersSent: number;
};

// Called by app/api/cron/deadline-reminders/route.ts on a daily schedule
// (Vercel Cron) and safe to re-run: notify()'s dedupe_key means a threshold
// that already fired for a filing never sends twice, so replaying this job
// is a no-op for anything already handled.
export async function runDeadlineReminders(now: Date = new Date()): Promise<DeadlineReminderResult> {
  const supabase = createServiceClient();

  const { data: filings } = await supabase
    .from("filings")
    .select("id, tracking_code, client_id, assessment_year, service_id, status, e_verified")
    .not("status", "in", `(${TERMINAL_FILING_STATUSES.join(",")})`);

  const activeFilings = filings ?? [];

  const serviceIds = [...new Set(activeFilings.map((filing) => filing.service_id))];
  const { data: services } =
    serviceIds.length > 0
      ? await supabase.from("services").select("id, applicable_deadline_type").in("id", serviceIds)
      : { data: [] };
  const serviceById = new Map((services ?? []).map((service) => [service.id, service]));

  const { data: deadlines } = await supabase
    .from("filing_deadlines")
    .select("assessment_year, filer_category, due_date");

  const clientIds = [...new Set(activeFilings.map((filing) => filing.client_id))];
  const { data: clients } =
    clientIds.length > 0 ? await supabase.from("users").select("id, email").in("id", clientIds) : { data: [] };
  const clientById = new Map((clients ?? []).map((client) => [client.id, client]));

  let deadlineRemindersSent = 0;
  let eVerifyRemindersSent = 0;

  for (const filing of activeFilings) {
    const service = serviceById.get(filing.service_id);
    const client = clientById.get(filing.client_id);
    if (!client) continue;

    const deadline = service
      ? deadlines?.find(
          (candidate) =>
            candidate.assessment_year === filing.assessment_year &&
            candidate.filer_category === service.applicable_deadline_type,
        )
      : undefined;

    if (deadline) {
      const daysLeft = daysUntil(deadline.due_date, now);
      if (REMINDER_THRESHOLDS.includes(daysLeft)) {
        const sent = await notify({
          filingId: filing.id,
          type: "deadline_reminder",
          to: client.email,
          subject: `Reminder: ${filing.tracking_code} is due in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
          html: `<p>Your filing <strong>${filing.tracking_code}</strong> is due on ${deadline.due_date}.</p>`,
          dedupeKey: `deadline_reminder:${daysLeft}`,
        });
        if (sent) deadlineRemindersSent++;
      }
    }

    // Filing isn't complete until e-verified — a real, easily-missed step.
    // Reminded once per filing (not on a schedule of its own), since we
    // don't track when it entered "filed_on_portal" separately from the
    // general status_history timestamp.
    if (filing.status === "filed_on_portal" && !filing.e_verified) {
      const sent = await notify({
        filingId: filing.id,
        type: "e_verify_reminder",
        to: client.email,
        subject: `Don't forget to e-verify ${filing.tracking_code}`,
        html: `<p>Your filing <strong>${filing.tracking_code}</strong> was filed on the portal but isn't e-verified yet — your return isn't complete until you do.</p>`,
        dedupeKey: "e_verify_reminder",
      });
      if (sent) eVerifyRemindersSent++;
    }
  }

  return { filingsScanned: activeFilings.length, deadlineRemindersSent, eVerifyRemindersSent };
}

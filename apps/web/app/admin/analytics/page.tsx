import Link from "next/link";

import { formatDeadlineCountdown, isAtRisk } from "@/lib/filings/deadline";
import { FILING_STATUS_LABELS, TERMINAL_FILING_STATUSES } from "@/lib/filings/status";
import { createClient } from "@/lib/supabase/server";

type Props = { searchParams: Promise<{ days?: string }> };

export default async function AdminAnalyticsPage({ searchParams }: Props) {
  const { days } = await searchParams;
  const thresholdDays = Number(days) > 0 ? Number(days) : 30;

  const supabase = await createClient();

  const { data: filings } = await supabase
    .from("filings")
    .select("id, tracking_code, status, assessment_year, client_id, service_id, assigned_preparer_id")
    .not("status", "in", `(${TERMINAL_FILING_STATUSES.join(",")})`);

  const serviceIds = [...new Set((filings ?? []).map((filing) => filing.service_id))];
  const { data: services } =
    serviceIds.length > 0
      ? await supabase.from("services").select("id, name, applicable_deadline_type").in("id", serviceIds)
      : { data: [] };
  const serviceById = new Map((services ?? []).map((service) => [service.id, service]));

  const { data: deadlines } = await supabase
    .from("filing_deadlines")
    .select("assessment_year, filer_category, due_date");

  const clientIds = [...new Set((filings ?? []).map((filing) => filing.client_id))];
  const { data: clients } =
    clientIds.length > 0 ? await supabase.from("users").select("id, name").in("id", clientIds) : { data: [] };
  const clientNameById = new Map((clients ?? []).map((client) => [client.id, client.name]));

  const preparerIds = [...new Set((filings ?? []).map((filing) => filing.assigned_preparer_id).filter(Boolean))] as string[];
  const { data: preparers } =
    preparerIds.length > 0 ? await supabase.from("users").select("id, name").in("id", preparerIds) : { data: [] };
  const preparerNameById = new Map((preparers ?? []).map((preparer) => [preparer.id, preparer.name]));

  const now = new Date();
  const atRiskFilings = (filings ?? [])
    .map((filing) => {
      const service = serviceById.get(filing.service_id);
      const deadline = service
        ? deadlines?.find(
            (d) => d.assessment_year === filing.assessment_year && d.filer_category === service.applicable_deadline_type,
          )
        : undefined;
      return { filing, service, deadline };
    })
    .filter(({ deadline }) => deadline && isAtRisk(deadline.due_date, now, thresholdDays))
    .sort((a, b) => a.deadline!.due_date.localeCompare(b.deadline!.due_date));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-12">
      <div>
        <h1 className="text-2xl font-semibold">Deadline risk</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Open filings (not yet processed or demanded) that are overdue or due within the window below.
        </p>
      </div>

      <form className="flex items-center gap-2" method="get">
        <label htmlFor="days" className="text-sm text-zinc-600 dark:text-zinc-400">
          Show filings due within
        </label>
        <input
          id="days"
          type="number"
          name="days"
          min={1}
          defaultValue={thresholdDays}
          className="w-20 rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <span className="text-sm text-zinc-600 dark:text-zinc-400">days</span>
        <button type="submit" className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background">
          Apply
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {atRiskFilings.length === 0 && <p className="text-sm text-zinc-500">No filings at risk in this window.</p>}
        {atRiskFilings.map(({ filing, service, deadline }) => (
          <Link
            key={filing.id}
            href={`/admin/filings/${filing.id}`}
            className="flex items-center justify-between rounded-md border border-zinc-200 p-3 hover:border-zinc-400 dark:border-zinc-800"
          >
            <div>
              <p className="text-sm font-medium">{service?.name ?? "Filing"}</p>
              <p className="text-xs text-zinc-500">
                {filing.tracking_code} — {clientNameById.get(filing.client_id) ?? "Unknown client"} — AY{" "}
                {filing.assessment_year}
              </p>
            </div>
            <div className="text-right text-xs">
              <p className="font-medium text-red-700 dark:text-red-400">{formatDeadlineCountdown(deadline!.due_date, now)}</p>
              <p className="text-zinc-500">{FILING_STATUS_LABELS[filing.status] ?? filing.status}</p>
              <p className="text-zinc-500">
                {filing.assigned_preparer_id ? (preparerNameById.get(filing.assigned_preparer_id) ?? "—") : "Unassigned"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

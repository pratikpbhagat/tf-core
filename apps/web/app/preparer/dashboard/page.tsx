import Link from "next/link";

import { getSessionUser } from "@/lib/auth/dal";
import { formatDeadlineCountdown } from "@/lib/filings/deadline";
import { FILING_STATUS_LABELS } from "@/lib/filings/status";
import { createClient } from "@/lib/supabase/server";

export default async function PreparerDashboardPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const supabase = await createClient();

  const { data: filings } = await supabase
    .from("filings")
    .select("id, tracking_code, status, assessment_year, client_id, service_id")
    .eq("assigned_preparer_id", user.id)
    .order("created_at", { ascending: false });

  const serviceIds = [...new Set((filings ?? []).map((filing) => filing.service_id))];
  const { data: services } =
    serviceIds.length > 0
      ? await supabase.from("services").select("id, name, applicable_deadline_type").in("id", serviceIds)
      : { data: [] };
  const serviceById = new Map((services ?? []).map((service) => [service.id, service]));

  const clientIds = [...new Set((filings ?? []).map((filing) => filing.client_id))];
  const { data: clients } =
    clientIds.length > 0 ? await supabase.from("users").select("id, name").in("id", clientIds) : { data: [] };
  const clientNameById = new Map((clients ?? []).map((client) => [client.id, client.name]));

  const { data: deadlines } = await supabase
    .from("filing_deadlines")
    .select("assessment_year, filer_category, due_date");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <h1 className="text-2xl font-semibold">Welcome, {user.name}</h1>
        <p className="text-sm text-zinc-500">Filings assigned to you</p>
      </div>

      {(filings ?? []).length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          No filings assigned to you yet — an admin can assign one from the firm-wide filings list.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {(filings ?? []).map((filing) => {
            const service = serviceById.get(filing.service_id);
            const deadline = service
              ? deadlines?.find(
                  (d) => d.assessment_year === filing.assessment_year && d.filer_category === service.applicable_deadline_type,
                )
              : undefined;

            return (
              <Link
                key={filing.id}
                href={`/preparer/filings/${filing.id}`}
                className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 hover:border-zinc-400 dark:border-zinc-800"
              >
                <div>
                  <p className="font-medium">{service?.name ?? "Filing"}</p>
                  <p className="text-xs text-zinc-500">
                    {filing.tracking_code} — {clientNameById.get(filing.client_id) ?? "Unknown client"} — AY{" "}
                    {filing.assessment_year}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{FILING_STATUS_LABELS[filing.status] ?? filing.status}</p>
                  {deadline && <p className="text-xs text-zinc-500">{formatDeadlineCountdown(deadline.due_date)}</p>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

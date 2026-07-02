import Link from "next/link";

import { getSessionUser } from "@/lib/auth/dal";
import { formatDeadlineCountdown } from "@/lib/filings/deadline";
import { FILING_STATUS_LABELS } from "@/lib/filings/status";
import { createClient } from "@/lib/supabase/server";

export default async function ClientDashboardPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const supabase = await createClient();

  const { data: filings } = await supabase
    .from("filings")
    .select("id, tracking_code, status, assessment_year, service_id")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  const serviceIds = [...new Set((filings ?? []).map((filing) => filing.service_id))];
  const { data: services } =
    serviceIds.length > 0
      ? await supabase.from("services").select("id, name, applicable_deadline_type").in("id", serviceIds)
      : { data: [] };
  const serviceById = new Map((services ?? []).map((service) => [service.id, service]));

  // filing_deadlines is a small reference table — fetching it whole and
  // matching in JS is simpler than a multi-column IN query for this list.
  const { data: deadlines } = await supabase
    .from("filing_deadlines")
    .select("assessment_year, filer_category, due_date");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Welcome, {user.name}</h1>
        <Link href="/services" className="text-sm font-medium underline">
          Start a new filing
        </Link>
      </div>

      {(filings ?? []).length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          You don&apos;t have any filings yet.{" "}
          <Link href="/services" className="underline">
            Browse services
          </Link>{" "}
          to get started.
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
                href={`/dashboard/filings/${filing.id}`}
                className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 hover:border-zinc-400 dark:border-zinc-800"
              >
                <div>
                  <p className="font-medium">{service?.name ?? "Filing"}</p>
                  <p className="text-xs text-zinc-500">
                    {filing.tracking_code} — AY {filing.assessment_year}
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

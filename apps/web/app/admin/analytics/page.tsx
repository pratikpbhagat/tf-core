import { ChartLine } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { StatusBadge } from "@/components/filings/status-badge";
import { Button } from "@/components/ui/button";
import { cardVariants } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDeadlineCountdown, isAtRisk } from "@/lib/filings/deadline";
import { TERMINAL_FILING_STATUSES } from "@/lib/filings/status";
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
        <p className="mt-1 text-sm text-muted-foreground">
          Open filings (not yet processed or demanded) that are overdue or due within the window below.
        </p>
      </div>

      <form className={cardVariants({ className: "flex flex-wrap items-center gap-2 p-4" })} method="get">
        <label htmlFor="days" className="text-sm text-muted-foreground">
          Show filings due within
        </label>
        <Input id="days" type="number" name="days" min={1} defaultValue={thresholdDays} className="h-9 w-20" />
        <span className="text-sm text-muted-foreground">days</span>
        <Button type="submit" size="sm">
          <ChartLine weight="bold" className="h-4 w-4" />
          Apply
        </Button>
      </form>

      <div className="flex flex-col gap-2">
        {atRiskFilings.length === 0 && <p className="text-sm text-muted-foreground">No filings at risk in this window.</p>}
        {atRiskFilings.map(({ filing, service, deadline }) => (
          <Link
            key={filing.id}
            href={`/admin/filings/${filing.id}`}
            className={cardVariants({ interactive: true, className: "flex items-center justify-between gap-3 p-3" })}
          >
            <div>
              <p className="text-sm font-medium">{service?.name ?? "Filing"}</p>
              <p className="text-xs text-muted-foreground">
                {filing.tracking_code} — {clientNameById.get(filing.client_id) ?? "Unknown client"} — AY{" "}
                {filing.assessment_year}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 text-xs">
              <p className="font-medium text-destructive">{formatDeadlineCountdown(deadline!.due_date, now)}</p>
              <StatusBadge status={filing.status} />
              <p className="text-muted-foreground">
                {filing.assigned_preparer_id ? (preparerNameById.get(filing.assigned_preparer_id) ?? "—") : "Unassigned"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

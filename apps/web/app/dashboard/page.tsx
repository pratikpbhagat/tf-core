import { CaretRight, ClockCountdown, FilePlus, FileText } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { StatusBadge } from "@/components/filings/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { cardVariants } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth/dal";
import { formatDeadlineCountdown } from "@/lib/filings/deadline";
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Welcome, {user.name}</h1>
        <Link href="/services" className={buttonVariants({ size: "sm" })}>
          <FilePlus weight="bold" className="h-4 w-4" />
          Start a new filing
        </Link>
      </div>

      {(filings ?? []).length === 0 ? (
        <div className={cardVariants({ className: "flex flex-col items-center gap-3 p-10 text-center" })}>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileText weight="bold" className="h-6 w-6" />
          </span>
          <p className="text-sm text-muted-foreground">
            You don&apos;t have any filings yet.{" "}
            <Link href="/services" className="font-medium text-primary hover:underline">
              Browse services
            </Link>{" "}
            to get started.
          </p>
        </div>
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
                className={cardVariants({ interactive: true, className: "flex items-center justify-between gap-4 p-4" })}
              >
                <div>
                  <p className="font-medium">{service?.name ?? "Filing"}</p>
                  <p className="text-xs text-muted-foreground">
                    {filing.tracking_code} — AY {filing.assessment_year}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={filing.status} />
                    {deadline && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ClockCountdown weight="bold" className="h-3.5 w-3.5" />
                        {formatDeadlineCountdown(deadline.due_date)}
                      </p>
                    )}
                  </div>
                  <CaretRight weight="bold" className="h-4 w-4 flex-none text-muted-foreground" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

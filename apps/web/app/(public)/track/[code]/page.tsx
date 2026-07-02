import { MagnifyingGlass, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import type { FilingStatus } from "@tf-core/db";
import Link from "next/link";

import { StatusBadge } from "@/components/filings/status-badge";
import { StatusTimeline } from "@/components/filings/status-timeline";
import { Card } from "@/components/ui/card";
import { createPublicClient } from "@/lib/supabase/public";

type Props = { params: Promise<{ code: string }> };

type TimelineEntry = { status: FilingStatus; note: string | null; created_at: string };

export async function generateMetadata({ params }: Props) {
  const { code } = await params;
  return { title: `Track ${code} — TaxFlow India` };
}

export default async function TrackResultPage({ params }: Props) {
  const { code } = await params;

  // Anon client calling the one narrow RPC that's exposed to anon (see
  // public_tracker_rpc.sql) — there is no direct anon access to filings
  // anywhere else in the schema.
  const supabase = createPublicClient();
  const { data } = await supabase.rpc("get_filing_status_by_tracking_code", { p_tracking_code: code });
  const result = data?.[0];

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-4 py-16">
      <div>
        <p className="text-sm text-muted-foreground">{code}</p>
        <h1 className="text-2xl font-semibold">Filing status</h1>
      </div>

      {!result ? (
        <Card className="flex flex-col items-center gap-3 p-6 text-center">
          <MagnifyingGlass weight="bold" className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t find a filing with that tracking code. Double check it and try again.
          </p>
          <Link href="/track" className="text-sm font-medium text-primary hover:underline">
            Try another code
          </Link>
        </Card>
      ) : (
        <>
          <Card className="flex flex-col gap-2 p-4">
            <p className="font-medium">{result.service_name}</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">AY {result.assessment_year}</span>
              <StatusBadge status={result.status} />
            </div>
            {result.e_verified && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-accent">
                <ShieldCheck weight="bold" className="h-4 w-4" />
                E-verified
              </p>
            )}
          </Card>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-medium">Timeline</h2>
            <StatusTimeline entries={(result.timeline as unknown as TimelineEntry[]) ?? []} />
          </section>
        </>
      )}
    </div>
  );
}

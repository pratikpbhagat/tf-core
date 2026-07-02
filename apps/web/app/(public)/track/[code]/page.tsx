import type { FilingStatus } from "@tf-core/db";
import Link from "next/link";

import { StatusTimeline } from "@/components/filings/status-timeline";
import { FILING_STATUS_LABELS } from "@/lib/filings/status";
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
        <p className="text-sm text-zinc-500">{code}</p>
        <h1 className="text-2xl font-semibold">Filing status</h1>
      </div>

      {!result ? (
        <div className="rounded-md border border-zinc-200 p-6 text-center dark:border-zinc-800">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            We couldn&apos;t find a filing with that tracking code. Double check it and try again.
          </p>
          <Link href="/track" className="mt-4 inline-block text-sm font-medium underline">
            Try another code
          </Link>
        </div>
      ) : (
        <>
          <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="font-medium">{result.service_name}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              AY {result.assessment_year} — {FILING_STATUS_LABELS[result.status] ?? result.status}
            </p>
            {result.e_verified && <p className="mt-1 text-xs text-green-700 dark:text-green-400">E-verified</p>}
          </div>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-medium">Timeline</h2>
            <StatusTimeline entries={(result.timeline as unknown as TimelineEntry[]) ?? []} />
          </section>
        </>
      )}
    </div>
  );
}

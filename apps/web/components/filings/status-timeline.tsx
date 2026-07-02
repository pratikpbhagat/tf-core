import type { FilingStatus } from "@tf-core/db";

import { FILING_STATUS_LABELS } from "@/lib/filings/status";

type TimelineEntry = { status: FilingStatus; note: string | null; created_at: string };

export function StatusTimeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-zinc-500">No status updates yet.</p>;
  }

  return (
    <ol className="flex flex-col gap-3">
      {entries.map((entry, index) => (
        <li
          key={`${entry.status}-${entry.created_at}-${index}`}
          className="flex flex-col gap-0.5 border-l-2 border-zinc-300 pl-3 dark:border-zinc-700"
        >
          <p className="text-sm font-medium">{FILING_STATUS_LABELS[entry.status] ?? entry.status}</p>
          <p className="text-xs text-zinc-500">
            {new Date(entry.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          </p>
          {entry.note && <p className="text-xs text-zinc-600 dark:text-zinc-400">{entry.note}</p>}
        </li>
      ))}
    </ol>
  );
}

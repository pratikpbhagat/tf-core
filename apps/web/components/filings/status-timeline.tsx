import { ClockCounterClockwise } from "@phosphor-icons/react/dist/ssr";
import type { FilingStatus } from "@tf-core/db";

import { FILING_STATUS_CONFIG } from "@/components/filings/status-badge";
import { TONE_DOT_CLASSES } from "@/components/ui/badge";
import { FILING_STATUS_LABELS } from "@/lib/filings/status";

type TimelineEntry = { status: FilingStatus; note: string | null; created_at: string };

export function StatusTimeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <ClockCounterClockwise weight="bold" className="h-4 w-4" />
        No status updates yet.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-4">
      {entries.map((entry, index) => (
        <li key={`${entry.status}-${entry.created_at}-${index}`} className="relative flex gap-3 pl-1">
          {index !== entries.length - 1 && (
            <span className="absolute top-4 left-[7px] h-full w-px bg-border" aria-hidden="true" />
          )}
          <span
            className={`mt-1 h-3.5 w-3.5 flex-none rounded-full ring-4 ring-background ${TONE_DOT_CLASSES[FILING_STATUS_CONFIG[entry.status].tone]}`}
          />
          <div className="flex flex-col gap-0.5 pb-1">
            <p className="text-sm font-medium">{FILING_STATUS_LABELS[entry.status] ?? entry.status}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(entry.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
            </p>
            {entry.note && <p className="text-xs text-muted-foreground">{entry.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

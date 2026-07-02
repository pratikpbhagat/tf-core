import type { ReactNode } from "react";

import type { ChecklistItem } from "@/lib/filings/checklist";

const STATUS_LABELS: Record<ChecklistItem["status"], string> = {
  missing: "Missing",
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
};

type Props = {
  item: ChecklistItem;
  signedUrl: string | null;
  children?: ReactNode;
};

// Shared by the client and preparer filing-detail pages: the checklist item
// shell is identical, only the action area differs (an upload form vs.
// approve/reject controls), passed in as children.
export function ChecklistItemCard({ item, signedUrl, children }: Props) {
  return (
    <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium">
            {item.label} {!item.required && <span className="text-xs text-zinc-500">(optional)</span>}
          </p>
          <p className="text-xs text-zinc-500">{STATUS_LABELS[item.status]}</p>
        </div>
        {signedUrl && (
          <a href={signedUrl} target="_blank" rel="noreferrer" className="text-xs font-medium underline">
            View file
          </a>
        )}
      </div>
      {item.status === "rejected" && item.latestDocument?.reviewer_note && (
        <p className="mt-2 text-xs text-red-600">Preparer note: {item.latestDocument.reviewer_note}</p>
      )}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

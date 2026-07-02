import { CheckCircle, Circle, Clock, WarningCircle, XCircle } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import type { ChecklistItem } from "@/lib/filings/checklist";

const STATUS_CONFIG: Record<ChecklistItem["status"], { label: string; icon: typeof CheckCircle; className: string }> = {
  missing: { label: "Missing", icon: Circle, className: "text-muted-foreground" },
  pending: { label: "Pending review", icon: Clock, className: "text-amber-600 dark:text-amber-400" },
  approved: { label: "Approved", icon: CheckCircle, className: "text-accent" },
  rejected: { label: "Rejected", icon: XCircle, className: "text-destructive" },
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
  const status = STATUS_CONFIG[item.status];
  const StatusIcon = status.icon;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium">
            {item.label} {!item.required && <span className="text-xs text-muted-foreground">(optional)</span>}
          </p>
          <p className={`flex items-center gap-1.5 text-xs ${status.className}`}>
            <StatusIcon weight="bold" className="h-3.5 w-3.5" />
            {status.label}
          </p>
        </div>
        {signedUrl && (
          <a href={signedUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-primary hover:underline">
            View file
          </a>
        )}
      </div>
      {item.status === "rejected" && item.latestDocument?.reviewer_note && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
          <WarningCircle weight="bold" className="h-3.5 w-3.5" />
          Preparer note: {item.latestDocument.reviewer_note}
        </p>
      )}
      {children && <div className="mt-3">{children}</div>}
    </Card>
  );
}

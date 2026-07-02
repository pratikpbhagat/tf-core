import {
  Calculator,
  CheckCircle,
  FileArrowDown,
  FileText,
  MagnifyingGlass,
  PaperPlaneTilt,
  ShieldCheck,
  Warning,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import type { FilingStatus } from "@tf-core/db";

import { Badge, type BadgeTone } from "@/components/ui/badge";
import { FILING_STATUS_LABELS } from "@/lib/filings/status";

export const FILING_STATUS_CONFIG: Record<FilingStatus, { tone: BadgeTone; icon: typeof CheckCircle }> = {
  submitted: { tone: "info", icon: PaperPlaneTilt },
  documents_under_review: { tone: "attention", icon: MagnifyingGlass },
  additional_info_needed: { tone: "caution", icon: WarningCircle },
  tax_computation_in_progress: { tone: "info", icon: Calculator },
  computation_shared_for_approval: { tone: "attention", icon: FileText },
  filed_on_portal: { tone: "success", icon: CheckCircle },
  itr_v_generated: { tone: "success", icon: FileArrowDown },
  e_verified: { tone: "success", icon: ShieldCheck },
  processed: { tone: "success", icon: CheckCircle },
  demand_raised: { tone: "danger", icon: Warning },
};

export function StatusBadge({ status, className }: { status: FilingStatus; className?: string }) {
  const config = FILING_STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge tone={config.tone} className={className}>
      <Icon weight="bold" className="h-3.5 w-3.5" />
      {FILING_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

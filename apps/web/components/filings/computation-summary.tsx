import { TrendDown, TrendUp } from "@phosphor-icons/react/dist/ssr";
import type { RegimeType } from "@tf-core/db";
import type { ReactNode } from "react";

const REGIME_LABELS: Record<RegimeType, string> = {
  old: "Old regime",
  new: "New regime",
  undecided: "Not yet decided",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    value,
  );
}

type Props = {
  regimeSelected: RegimeType;
  regimeComparisonNote: string | null;
  taxComputed: number | null;
  refundOrDemand: number | null;
  // The client-only regime-selection form, passed in so this component stays
  // usable read-only elsewhere (e.g. a future preparer/admin view) without
  // dragging in a client-side action it can't call.
  regimeControls?: ReactNode;
};

export function ComputationSummary({
  regimeSelected,
  regimeComparisonNote,
  taxComputed,
  refundOrDemand,
  regimeControls,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Tax regime</p>
        <p className="text-sm font-medium">{REGIME_LABELS[regimeSelected]}</p>
      </div>
      {regimeComparisonNote && <p className="text-xs text-muted-foreground">{regimeComparisonNote}</p>}
      {regimeControls}

      {taxComputed !== null && (
        <div className="flex items-center justify-between border-t border-border pt-3">
          <p className="text-sm text-muted-foreground">Tax computed</p>
          <p className="text-sm font-medium">{formatCurrency(taxComputed)}</p>
        </div>
      )}
      {refundOrDemand !== null && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{refundOrDemand >= 0 ? "Refund" : "Demand"}</p>
          <p
            className={`flex items-center gap-1 text-sm font-medium ${
              refundOrDemand >= 0 ? "text-accent" : "text-destructive"
            }`}
          >
            {refundOrDemand >= 0 ? (
              <TrendUp weight="bold" className="h-4 w-4" />
            ) : (
              <TrendDown weight="bold" className="h-4 w-4" />
            )}
            {formatCurrency(Math.abs(refundOrDemand))}
          </p>
        </div>
      )}
    </div>
  );
}

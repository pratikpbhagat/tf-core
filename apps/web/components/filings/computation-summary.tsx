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
    <div className="flex flex-col gap-3 rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Tax regime</p>
        <p className="text-sm font-medium">{REGIME_LABELS[regimeSelected]}</p>
      </div>
      {regimeComparisonNote && <p className="text-xs text-zinc-500">{regimeComparisonNote}</p>}
      {regimeControls}

      {taxComputed !== null && (
        <div className="flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-zinc-800">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Tax computed</p>
          <p className="text-sm font-medium">{formatCurrency(taxComputed)}</p>
        </div>
      )}
      {refundOrDemand !== null && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{refundOrDemand >= 0 ? "Refund" : "Demand"}</p>
          <p
            className={`text-sm font-medium ${
              refundOrDemand >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
            }`}
          >
            {formatCurrency(Math.abs(refundOrDemand))}
          </p>
        </div>
      )}
    </div>
  );
}

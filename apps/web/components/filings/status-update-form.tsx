"use client";

import type { FilingStatus } from "@tf-core/db";
import { useActionState } from "react";

import { updateFilingStatus, type UpdateFilingStatusState } from "@/actions/filings";
import { FILING_STATUS_LABELS, FILING_STATUS_VALUES } from "@/lib/filings/status";

const initialState: UpdateFilingStatusState = undefined;

type Props = {
  filingId: string;
  currentStatus: FilingStatus;
  currentTaxComputed: number | null;
  currentRefundOrDemand: number | null;
  currentRegimeComparisonNote: string | null;
  currentEVerified: boolean;
};

// Shared by the preparer and admin filing-detail pages. Every field uses a
// `key` tied to its current server value so the uncontrolled inputs remount
// (and pick up the fresh defaultValue) after a save — otherwise React leaves
// the old value on screen even though the server state changed. Fields are
// pre-filled with current values so submitting without touching them doesn't
// wipe out previously-set computation data.
export function StatusUpdateForm({
  filingId,
  currentStatus,
  currentTaxComputed,
  currentRefundOrDemand,
  currentRegimeComparisonNote,
  currentEVerified,
}: Props) {
  const [state, action, pending] = useActionState(updateFilingStatus, initialState);

  return (
    <form action={action} className="flex flex-col gap-3 rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
      <input type="hidden" name="filingId" value={filingId} />

      <div className="flex flex-col gap-1">
        <label htmlFor="status" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Status
        </label>
        <select
          id="status"
          key={currentStatus}
          name="status"
          defaultValue={currentStatus}
          className="rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          {FILING_STATUS_VALUES.map((value) => (
            <option key={value} value={value}>
              {FILING_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="taxComputed" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Tax computed (₹)
          </label>
          <input
            id="taxComputed"
            key={`tax-${currentTaxComputed}`}
            type="number"
            name="taxComputed"
            step="0.01"
            defaultValue={currentTaxComputed ?? ""}
            className="rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="refundOrDemand" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Refund (+) / Demand (-) (₹)
          </label>
          <input
            id="refundOrDemand"
            key={`refund-${currentRefundOrDemand}`}
            type="number"
            name="refundOrDemand"
            step="0.01"
            defaultValue={currentRefundOrDemand ?? ""}
            className="rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="regimeComparisonNote" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Regime comparison note
        </label>
        <textarea
          id="regimeComparisonNote"
          key={`note-${currentRegimeComparisonNote}`}
          name="regimeComparisonNote"
          rows={2}
          defaultValue={currentRegimeComparisonNote ?? ""}
          className="rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <label className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
        <input key={`ev-${currentEVerified}`} type="checkbox" name="eVerified" defaultChecked={currentEVerified} />
        E-verified
      </label>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background disabled:opacity-60"
        >
          {pending ? "Saving..." : "Update filing"}
        </button>
        {state?.message && <span className="text-xs text-red-600">{state.message}</span>}
      </div>
    </form>
  );
}

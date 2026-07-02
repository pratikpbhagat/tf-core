"use client";

import type { FilingStatus } from "@tf-core/db";
import { useActionState } from "react";

import { updateFilingStatus, type UpdateFilingStatusState } from "@/actions/filings";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/input";
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
    <form action={action} className="flex flex-col gap-3 rounded-md border border-border bg-muted/40 p-4">
      <input type="hidden" name="filingId" value={filingId} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="status">Status</Label>
        <Select id="status" key={currentStatus} name="status" defaultValue={currentStatus}>
          {FILING_STATUS_VALUES.map((value) => (
            <option key={value} value={value}>
              {FILING_STATUS_LABELS[value]}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="taxComputed">Tax computed (₹)</Label>
          <Input
            id="taxComputed"
            key={`tax-${currentTaxComputed}`}
            type="number"
            name="taxComputed"
            step="0.01"
            defaultValue={currentTaxComputed ?? ""}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="refundOrDemand">Refund (+) / Demand (-) (₹)</Label>
          <Input
            id="refundOrDemand"
            key={`refund-${currentRefundOrDemand}`}
            type="number"
            name="refundOrDemand"
            step="0.01"
            defaultValue={currentRefundOrDemand ?? ""}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="regimeComparisonNote">Regime comparison note</Label>
        <Textarea
          id="regimeComparisonNote"
          key={`note-${currentRegimeComparisonNote}`}
          name="regimeComparisonNote"
          rows={2}
          defaultValue={currentRegimeComparisonNote ?? ""}
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <input
          key={`ev-${currentEVerified}`}
          type="checkbox"
          name="eVerified"
          defaultChecked={currentEVerified}
          className="h-4 w-4 accent-primary"
        />
        E-verified
      </label>

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving..." : "Update filing"}
        </Button>
        <FieldError>{state?.message}</FieldError>
      </div>
    </form>
  );
}

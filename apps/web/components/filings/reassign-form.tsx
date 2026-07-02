"use client";

import { useActionState } from "react";

import { reassignFiling, type ReassignFilingState } from "@/actions/filings";
import { Button } from "@/components/ui/button";
import { FieldError, Select } from "@/components/ui/input";

const initialState: ReassignFilingState = undefined;

type Preparer = { id: string; name: string };

export function ReassignForm({
  filingId,
  currentPreparerId,
  preparers,
}: {
  filingId: string;
  currentPreparerId: string | null;
  preparers: Preparer[];
}) {
  const [state, action, pending] = useActionState(reassignFiling, initialState);

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="filingId" value={filingId} />
      <Select
        key={currentPreparerId}
        name="preparerId"
        aria-label="Assign preparer"
        defaultValue={currentPreparerId ?? ""}
        className="h-9 text-xs"
      >
        <option value="" disabled>
          Select preparer
        </option>
        {preparers.map((preparer) => (
          <option key={preparer.id} value={preparer.id}>
            {preparer.name}
          </option>
        ))}
      </Select>
      <Button type="submit" variant="outline" size="sm" disabled={pending} className="h-9 text-xs">
        {pending ? "Saving..." : "Reassign"}
      </Button>
      <FieldError>{state?.message}</FieldError>
    </form>
  );
}

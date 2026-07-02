"use client";

import type { RegimeType } from "@tf-core/db";
import { useActionState } from "react";

import { setFilingRegime, type SetFilingRegimeState } from "@/actions/filings";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";

const initialState: SetFilingRegimeState = undefined;

export function RegimeForm({ filingId, currentRegime }: { filingId: string; currentRegime: RegimeType }) {
  const [state, action, pending] = useActionState(setFilingRegime, initialState);

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="filingId" value={filingId} />
      <Select key={currentRegime} name="regime" aria-label="Tax regime" defaultValue={currentRegime} className="h-9 text-xs">
        <option value="undecided">Not yet decided</option>
        <option value="old">Old regime</option>
        <option value="new">New regime</option>
      </Select>
      <Button type="submit" variant="outline" size="sm" disabled={pending} className="h-9 text-xs">
        {pending ? "Saving..." : "Save"}
      </Button>
      {state?.message && <span className="text-xs text-destructive">{state.message}</span>}
    </form>
  );
}

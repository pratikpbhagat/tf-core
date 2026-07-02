"use client";

import type { RegimeType } from "@tf-core/db";
import { useActionState } from "react";

import { setFilingRegime, type SetFilingRegimeState } from "@/actions/filings";

const initialState: SetFilingRegimeState = undefined;

export function RegimeForm({ filingId, currentRegime }: { filingId: string; currentRegime: RegimeType }) {
  const [state, action, pending] = useActionState(setFilingRegime, initialState);

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="filingId" value={filingId} />
      <select
        key={currentRegime}
        name="regime"
        aria-label="Tax regime"
        defaultValue={currentRegime}
        className="rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
      >
        <option value="undecided">Not yet decided</option>
        <option value="old">Old regime</option>
        <option value="new">New regime</option>
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium disabled:opacity-60 dark:border-zinc-700"
      >
        {pending ? "Saving..." : "Save"}
      </button>
      {state?.message && <span className="text-xs text-red-600">{state.message}</span>}
    </form>
  );
}

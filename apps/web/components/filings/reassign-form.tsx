"use client";

import { useActionState } from "react";

import { reassignFiling, type ReassignFilingState } from "@/actions/filings";

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
      <select
        key={currentPreparerId}
        name="preparerId"
        aria-label="Assign preparer"
        defaultValue={currentPreparerId ?? ""}
        className="rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
      >
        <option value="" disabled>
          Select preparer
        </option>
        {preparers.map((preparer) => (
          <option key={preparer.id} value={preparer.id}>
            {preparer.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium disabled:opacity-60 dark:border-zinc-700"
      >
        {pending ? "Saving..." : "Reassign"}
      </button>
      {state?.message && <span className="text-xs text-red-600">{state.message}</span>}
    </form>
  );
}

"use client";

import { useActionState } from "react";

import { createFiling, type CreateFilingState } from "@/actions/filings";

const initialState: CreateFilingState = undefined;

export function CreateFilingForm({ serviceId, assessmentYear }: { serviceId: string; assessmentYear: string }) {
  const [state, action, pending] = useActionState(createFiling, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="assessmentYear" value={assessmentYear} />
      {state?.message && <p className="text-sm text-red-600">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
      >
        {pending ? "Starting..." : "Confirm & start filing"}
      </button>
    </form>
  );
}

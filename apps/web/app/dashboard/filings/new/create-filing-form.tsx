"use client";

import { useActionState } from "react";

import { createFiling, type CreateFilingState } from "@/actions/filings";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/input";

const initialState: CreateFilingState = undefined;

export function CreateFilingForm({ serviceId, assessmentYear }: { serviceId: string; assessmentYear: string }) {
  const [state, action, pending] = useActionState(createFiling, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="assessmentYear" value={assessmentYear} />
      <FieldError>{state?.message}</FieldError>
      <Button type="submit" disabled={pending}>
        {pending ? "Starting..." : "Confirm & start filing"}
      </Button>
    </form>
  );
}

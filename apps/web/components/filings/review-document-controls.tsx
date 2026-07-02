"use client";

import { Check, X } from "@phosphor-icons/react/dist/ssr";
import { useActionState } from "react";

import { reviewDocument, type ReviewDocumentState } from "@/actions/documents";
import { Input } from "@/components/ui/input";

const initialState: ReviewDocumentState = undefined;

export function ReviewDocumentControls({ documentId }: { documentId: string }) {
  const [state, action, pending] = useActionState(reviewDocument, initialState);

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="documentId" value={documentId} />
      <Input
        type="text"
        name="reviewerNote"
        aria-label="Reviewer note"
        placeholder="Note (required if rejecting)"
        className="h-9 text-xs"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          name="status"
          value="approved"
          disabled={pending}
          className="inline-flex items-center gap-1 rounded-md border border-emerald-300 px-2 py-1 text-xs font-medium text-emerald-700 disabled:opacity-60 dark:border-emerald-800 dark:text-emerald-400"
        >
          <Check weight="bold" className="h-3.5 w-3.5" />
          Approve
        </button>
        <button
          type="submit"
          name="status"
          value="rejected"
          disabled={pending}
          className="inline-flex items-center gap-1 rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-700 disabled:opacity-60 dark:border-red-800 dark:text-red-400"
        >
          <X weight="bold" className="h-3.5 w-3.5" />
          Reject
        </button>
        {state?.message && <span className="text-xs text-destructive">{state.message}</span>}
      </div>
    </form>
  );
}

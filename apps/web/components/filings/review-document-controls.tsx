"use client";

import { useActionState } from "react";

import { reviewDocument, type ReviewDocumentState } from "@/actions/documents";

const initialState: ReviewDocumentState = undefined;

export function ReviewDocumentControls({ documentId }: { documentId: string }) {
  const [state, action, pending] = useActionState(reviewDocument, initialState);

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="documentId" value={documentId} />
      <input
        type="text"
        name="reviewerNote"
        aria-label="Reviewer note"
        placeholder="Note (required if rejecting)"
        className="rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          name="status"
          value="approved"
          disabled={pending}
          className="rounded-md border border-green-300 px-2 py-1 text-xs font-medium text-green-700 disabled:opacity-60 dark:border-green-800 dark:text-green-400"
        >
          Approve
        </button>
        <button
          type="submit"
          name="status"
          value="rejected"
          disabled={pending}
          className="rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-700 disabled:opacity-60 dark:border-red-800 dark:text-red-400"
        >
          Reject
        </button>
        {state?.message && <span className="text-xs text-red-600">{state.message}</span>}
      </div>
    </form>
  );
}

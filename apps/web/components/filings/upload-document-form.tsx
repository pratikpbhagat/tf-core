"use client";

import { useActionState } from "react";

import { uploadDocument, type UploadDocumentState } from "@/actions/documents";

const initialState: UploadDocumentState = undefined;

export function UploadDocumentForm({ filingId, documentType }: { filingId: string; documentType: string }) {
  const [state, action, pending] = useActionState(uploadDocument, initialState);

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="filingId" value={filingId} />
      <input type="hidden" name="documentType" value={documentType} />
      <input type="file" name="file" aria-label="Choose file to upload" required className="text-xs" />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium disabled:opacity-60 dark:border-zinc-700"
      >
        {pending ? "Uploading..." : "Upload"}
      </button>
      {state?.message && <span className="text-xs text-red-600">{state.message}</span>}
    </form>
  );
}

"use client";

import { UploadSimple } from "@phosphor-icons/react/dist/ssr";
import { useActionState } from "react";

import { uploadDocument, type UploadDocumentState } from "@/actions/documents";
import { Button } from "@/components/ui/button";

const initialState: UploadDocumentState = undefined;

export function UploadDocumentForm({ filingId, documentType }: { filingId: string; documentType: string }) {
  const [state, action, pending] = useActionState(uploadDocument, initialState);

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="filingId" value={filingId} />
      <input type="hidden" name="documentType" value={documentType} />
      <input
        type="file"
        name="file"
        accept="application/pdf,image/jpeg,image/png"
        aria-label="Choose file to upload"
        required
        className="text-xs"
      />
      <Button type="submit" variant="outline" size="sm" disabled={pending} className="h-9 text-xs">
        <UploadSimple weight="bold" className="h-3.5 w-3.5" />
        {pending ? "Uploading..." : "Upload"}
      </Button>
      {state?.message && <span className="text-xs text-destructive">{state.message}</span>}
    </form>
  );
}

"use client";

import { Eye } from "@phosphor-icons/react/dist/ssr";
import { useActionState } from "react";

import { revealPan, type RevealPanState } from "@/actions/identity";

const initialState: RevealPanState = undefined;

export function RevealPanButton({ userId, maskedPan }: { userId: string; maskedPan: string | null }) {
  const [state, action, pending] = useActionState(revealPan, initialState);

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <span className="font-mono text-sm">{state?.pan ?? maskedPan ?? "Not on file"}</span>
      {!state?.pan && maskedPan && (
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:opacity-60"
        >
          <Eye weight="bold" className="h-3.5 w-3.5" />
          {pending ? "Revealing..." : "Reveal"}
        </button>
      )}
      {state?.message && <span className="text-xs text-destructive">{state.message}</span>}
    </form>
  );
}

"use client";

import { useActionState } from "react";

import { revealPan, type RevealPanState } from "@/actions/identity";

const initialState: RevealPanState = undefined;

export function RevealPanButton({ userId, maskedPan }: { userId: string; maskedPan: string | null }) {
  const [state, action, pending] = useActionState(revealPan, initialState);

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <span className="text-sm font-mono">{state?.pan ?? maskedPan ?? "Not on file"}</span>
      {!state?.pan && maskedPan && (
        <button type="submit" disabled={pending} className="text-xs font-medium underline disabled:opacity-60">
          {pending ? "Revealing..." : "Reveal"}
        </button>
      )}
      {state?.message && <span className="text-xs text-red-600">{state.message}</span>}
    </form>
  );
}

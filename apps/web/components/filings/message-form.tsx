"use client";

import { useActionState, useRef } from "react";

import { sendMessage, type SendMessageState } from "@/actions/messages";

const initialState: SendMessageState = undefined;

// `allowInternal` shows an "internal note" checkbox for preparer/admin
// callers. Clients never get this prop — and even if they did, the
// sendMessage action itself forces is_internal=false for the client role.
export function MessageForm({ filingId, allowInternal = false }: { filingId: string; allowInternal?: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(async (prevState: SendMessageState, formData: FormData) => {
    const result = await sendMessage(prevState, formData);
    if (!result) formRef.current?.reset();
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-2">
      <input type="hidden" name="filingId" value={filingId} />
      <label htmlFor="message" className="sr-only">
        Message
      </label>
      <textarea
        id="message"
        name="message"
        required
        rows={2}
        placeholder={allowInternal ? "Message the client, or check 'Internal note' below..." : "Message your preparer..."}
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background disabled:opacity-60"
        >
          {pending ? "Sending..." : "Send"}
        </button>
        {allowInternal && (
          <label className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <input type="checkbox" name="isInternal" />
            Internal note (client won&apos;t see this)
          </label>
        )}
        {state?.message && <span className="text-xs text-red-600">{state.message}</span>}
      </div>
    </form>
  );
}

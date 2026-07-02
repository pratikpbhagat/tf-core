"use client";

import { PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";
import { useActionState, useRef } from "react";

import { sendMessage, type SendMessageState } from "@/actions/messages";
import { Button } from "@/components/ui/button";
import { FieldError, Textarea } from "@/components/ui/input";

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
      <Textarea
        id="message"
        name="message"
        required
        rows={2}
        placeholder={allowInternal ? "Message the client, or check 'Internal note' below..." : "Message your preparer..."}
      />
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          <PaperPlaneTilt weight="bold" className="h-4 w-4" />
          {pending ? "Sending..." : "Send"}
        </Button>
        {allowInternal && (
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <input type="checkbox" name="isInternal" className="accent-primary" />
            Internal note (client won&apos;t see this)
          </label>
        )}
        <FieldError>{state?.message}</FieldError>
      </div>
    </form>
  );
}

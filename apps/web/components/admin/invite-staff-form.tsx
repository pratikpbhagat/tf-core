"use client";

import { useActionState, useRef } from "react";

import { inviteStaff, type InviteStaffState } from "@/actions/staff";

const initialState: InviteStaffState = undefined;
const inputClass = "rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export function InviteStaffForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(async (prevState: InviteStaffState, formData: FormData) => {
    const result = await inviteStaff(prevState, formData);
    if (!result) formRef.current?.reset();
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3 rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="grid grid-cols-2 gap-3">
        <input name="name" aria-label="Name" placeholder="Name" required className={inputClass} />
        <input name="email" type="email" aria-label="Email" placeholder="Email" required className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <select name="role" aria-label="Role" defaultValue="preparer" className={inputClass}>
          <option value="preparer">Preparer</option>
          <option value="admin">Admin</option>
        </select>
        <input
          name="password"
          type="text"
          aria-label="Temporary password"
          placeholder="Temporary password (min 8 chars)"
          required
          minLength={8}
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background disabled:opacity-60"
      >
        {pending ? "Creating..." : "Invite staff"}
      </button>
      {state?.message && <p className="text-xs text-red-600">{state.message}</p>}
    </form>
  );
}

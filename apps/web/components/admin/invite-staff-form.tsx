"use client";

import { useActionState, useRef } from "react";

import { inviteStaff, type InviteStaffState } from "@/actions/staff";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Select } from "@/components/ui/input";

const initialState: InviteStaffState = undefined;

export function InviteStaffForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(async (prevState: InviteStaffState, formData: FormData) => {
    const result = await inviteStaff(prevState, formData);
    if (!result) formRef.current?.reset();
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3 rounded-md border border-border bg-card p-4">
      <div className="grid grid-cols-2 gap-3">
        <Input name="name" aria-label="Name" placeholder="Name" required />
        <Input name="email" type="email" aria-label="Email" placeholder="Email" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select name="role" aria-label="Role" defaultValue="preparer">
          <option value="preparer">Preparer</option>
          <option value="admin">Admin</option>
        </Select>
        <Input
          name="password"
          type="text"
          aria-label="Temporary password"
          placeholder="Temporary password (min 8 chars)"
          required
          minLength={8}
        />
      </div>
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Creating..." : "Invite staff"}
      </Button>
      <FieldError>{state?.message}</FieldError>
    </form>
  );
}

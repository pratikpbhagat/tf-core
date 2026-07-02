"use client";

import { useActionState } from "react";

import { upsertFilingDeadline, type UpsertDeadlineState } from "@/actions/services";

const initialState: UpsertDeadlineState = undefined;

const inputClass = "rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900";

export type DeadlineFormValues = {
  id?: string;
  assessmentYear: string;
  filerCategory: "individual" | "audit" | "transfer_pricing";
  dueDate: string;
  isExtended: boolean;
  sourceNotificationRef: string;
};

export function DeadlineForm({ defaultValues }: { defaultValues: DeadlineFormValues }) {
  const [state, action, pending] = useActionState(upsertFilingDeadline, initialState);
  // This form renders once per existing deadline row plus once blank — ids
  // must be unique per instance, or htmlFor only ever binds to the first one.
  const instanceKey = defaultValues.id ?? "new";

  return (
    <form action={action} className="flex flex-wrap items-end gap-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
      {defaultValues.id && <input type="hidden" name="id" value={defaultValues.id} />}

      <div className="flex flex-col gap-1">
        <label htmlFor={`assessmentYear-${instanceKey}`} className="text-[10px] text-zinc-500">
          Assessment year
        </label>
        <input
          id={`assessmentYear-${instanceKey}`}
          name="assessmentYear"
          defaultValue={defaultValues.assessmentYear}
          required
          placeholder="2025-26"
          className={`${inputClass} w-24`}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`filerCategory-${instanceKey}`} className="text-[10px] text-zinc-500">
          Filer category
        </label>
        <select
          id={`filerCategory-${instanceKey}`}
          name="filerCategory"
          defaultValue={defaultValues.filerCategory}
          className={inputClass}
        >
          <option value="individual">Individual</option>
          <option value="audit">Audit</option>
          <option value="transfer_pricing">Transfer pricing</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`dueDate-${instanceKey}`} className="text-[10px] text-zinc-500">
          Due date
        </label>
        <input
          id={`dueDate-${instanceKey}`}
          type="date"
          name="dueDate"
          defaultValue={defaultValues.dueDate}
          required
          className={inputClass}
        />
      </div>

      <label className="flex items-center gap-1 text-[10px] text-zinc-500">
        <input type="checkbox" name="isExtended" defaultChecked={defaultValues.isExtended} />
        Extended
      </label>

      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor={`sourceNotificationRef-${instanceKey}`} className="text-[10px] text-zinc-500">
          Source notification ref
        </label>
        <input
          id={`sourceNotificationRef-${instanceKey}`}
          name="sourceNotificationRef"
          defaultValue={defaultValues.sourceNotificationRef}
          className={`${inputClass} w-full`}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-foreground px-3 py-1 text-xs font-medium text-background disabled:opacity-60"
      >
        {pending ? "Saving..." : defaultValues.id ? "Save" : "Add"}
      </button>
      {state?.message && <span className="w-full text-xs text-red-600">{state.message}</span>}
    </form>
  );
}

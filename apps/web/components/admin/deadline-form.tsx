"use client";

import { useActionState } from "react";

import { upsertFilingDeadline, type UpsertDeadlineState } from "@/actions/services";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";

const initialState: UpsertDeadlineState = undefined;
const inputClass = "h-9 text-xs";

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
    <form action={action} className="flex flex-wrap items-end gap-2 rounded-md border border-border bg-card p-3">
      {defaultValues.id && <input type="hidden" name="id" value={defaultValues.id} />}

      <div className="flex flex-col gap-1">
        <label htmlFor={`assessmentYear-${instanceKey}`} className="text-[10px] text-muted-foreground">
          Assessment year
        </label>
        <Input
          id={`assessmentYear-${instanceKey}`}
          name="assessmentYear"
          defaultValue={defaultValues.assessmentYear}
          required
          placeholder="2025-26"
          className={`${inputClass} w-24`}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`filerCategory-${instanceKey}`} className="text-[10px] text-muted-foreground">
          Filer category
        </label>
        <Select
          id={`filerCategory-${instanceKey}`}
          name="filerCategory"
          defaultValue={defaultValues.filerCategory}
          className={inputClass}
        >
          <option value="individual">Individual</option>
          <option value="audit">Audit</option>
          <option value="transfer_pricing">Transfer pricing</option>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`dueDate-${instanceKey}`} className="text-[10px] text-muted-foreground">
          Due date
        </label>
        <Input
          id={`dueDate-${instanceKey}`}
          type="date"
          name="dueDate"
          defaultValue={defaultValues.dueDate}
          required
          className={inputClass}
        />
      </div>

      <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <input type="checkbox" name="isExtended" defaultChecked={defaultValues.isExtended} className="accent-primary" />
        Extended
      </label>

      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor={`sourceNotificationRef-${instanceKey}`} className="text-[10px] text-muted-foreground">
          Source notification ref
        </label>
        <Input
          id={`sourceNotificationRef-${instanceKey}`}
          name="sourceNotificationRef"
          defaultValue={defaultValues.sourceNotificationRef}
          className={`${inputClass} w-full`}
        />
      </div>

      <Button type="submit" variant="outline" size="sm" disabled={pending} className="h-9 text-xs">
        {pending ? "Saving..." : defaultValues.id ? "Save" : "Add"}
      </Button>
      {state?.message && <span className="w-full text-xs text-destructive">{state.message}</span>}
    </form>
  );
}

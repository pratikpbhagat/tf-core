"use client";

import { useActionState } from "react";

import { upsertService, type UpsertServiceState } from "@/actions/services";

const initialState: UpsertServiceState = undefined;

const inputClass = "rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900";
const labelClass = "text-xs font-medium text-zinc-600 dark:text-zinc-400";

export type ServiceFormValues = {
  id?: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  eligibilityCriteria: string;
  requiredDocumentsJson: string;
  faqJson: string;
  applicableDeadlineType: "individual" | "audit" | "transfer_pricing";
  priceDisplay: string;
  isActive: boolean;
};

export function ServiceForm({ defaultValues }: { defaultValues: ServiceFormValues }) {
  const [state, action, pending] = useActionState(upsertService, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      {defaultValues.id && <input type="hidden" name="id" value={defaultValues.id} />}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input id="name" name="name" defaultValue={defaultValues.name} required className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="slug" className={labelClass}>
            Slug
          </label>
          <input id="slug" name="slug" defaultValue={defaultValues.slug} required className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="category" className={labelClass}>
            Category
          </label>
          <input id="category" name="category" defaultValue={defaultValues.category} required className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="applicableDeadlineType" className={labelClass}>
            Deadline type
          </label>
          <select
            id="applicableDeadlineType"
            name="applicableDeadlineType"
            defaultValue={defaultValues.applicableDeadlineType}
            className={inputClass}
          >
            <option value="individual">Individual</option>
            <option value="audit">Audit</option>
            <option value="transfer_pricing">Transfer pricing</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={defaultValues.description}
          required
          rows={2}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="eligibilityCriteria" className={labelClass}>
          Eligibility criteria
        </label>
        <textarea
          id="eligibilityCriteria"
          name="eligibilityCriteria"
          defaultValue={defaultValues.eligibilityCriteria}
          required
          rows={3}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="requiredDocumentsJson" className={labelClass}>
          Required documents — JSON array of {"{document_type, label, required}"}
        </label>
        <textarea
          id="requiredDocumentsJson"
          name="requiredDocumentsJson"
          defaultValue={defaultValues.requiredDocumentsJson}
          required
          rows={6}
          className={`${inputClass} font-mono text-xs`}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="faqJson" className={labelClass}>
          FAQ — JSON array of {"{question, answer}"}
        </label>
        <textarea
          id="faqJson"
          name="faqJson"
          defaultValue={defaultValues.faqJson}
          required
          rows={5}
          className={`${inputClass} font-mono text-xs`}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="priceDisplay" className={labelClass}>
          Price display
        </label>
        <input id="priceDisplay" name="priceDisplay" defaultValue={defaultValues.priceDisplay} required className={inputClass} />
      </div>

      <label className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
        <input type="checkbox" name="isActive" defaultChecked={defaultValues.isActive} />
        Active (visible on public site)
      </label>

      {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save service"}
      </button>
    </form>
  );
}

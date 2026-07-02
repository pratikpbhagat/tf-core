"use client";

import { useActionState } from "react";

import { upsertService, type UpsertServiceState } from "@/actions/services";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/input";

const initialState: UpsertServiceState = undefined;

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
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={defaultValues.name} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={defaultValues.slug} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" defaultValue={defaultValues.category} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="applicableDeadlineType">Deadline type</Label>
          <Select id="applicableDeadlineType" name="applicableDeadlineType" defaultValue={defaultValues.applicableDeadlineType}>
            <option value="individual">Individual</option>
            <option value="audit">Audit</option>
            <option value="transfer_pricing">Transfer pricing</option>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={defaultValues.description} required rows={2} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="eligibilityCriteria">Eligibility criteria</Label>
        <Textarea
          id="eligibilityCriteria"
          name="eligibilityCriteria"
          defaultValue={defaultValues.eligibilityCriteria}
          required
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="requiredDocumentsJson">
          Required documents — JSON array of {"{document_type, label, required}"}
        </Label>
        <Textarea
          id="requiredDocumentsJson"
          name="requiredDocumentsJson"
          defaultValue={defaultValues.requiredDocumentsJson}
          required
          rows={6}
          className="font-mono text-xs"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="faqJson">FAQ — JSON array of {"{question, answer}"}</Label>
        <Textarea
          id="faqJson"
          name="faqJson"
          defaultValue={defaultValues.faqJson}
          required
          rows={5}
          className="font-mono text-xs"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="priceDisplay">Price display</Label>
        <Input id="priceDisplay" name="priceDisplay" defaultValue={defaultValues.priceDisplay} required />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <input type="checkbox" name="isActive" defaultChecked={defaultValues.isActive} className="h-4 w-4 accent-primary" />
        Active (visible on public site)
      </label>

      <FieldError>{state?.message}</FieldError>

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving..." : "Save service"}
      </Button>
    </form>
  );
}

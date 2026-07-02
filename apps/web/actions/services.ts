"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";

import { getSessionUser } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

const RequiredDocumentSchema = z.object({
  document_type: z.string().min(1),
  label: z.string().min(1),
  required: z.boolean(),
});

const FaqEntrySchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

const ServiceFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Name is required."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required.")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only."),
  category: z.string().trim().min(1, "Category is required."),
  description: z.string().trim().min(1, "Description is required."),
  eligibilityCriteria: z.string().trim().min(1, "Eligibility criteria is required."),
  requiredDocumentsJson: z.string(),
  faqJson: z.string(),
  applicableDeadlineType: z.enum(["individual", "audit", "transfer_pricing"]),
  priceDisplay: z.string().trim().min(1, "Price display is required."),
  isActive: z.string().optional(),
});

export type UpsertServiceState = { message?: string } | undefined;

// Admin-only, backed by services_admin_insert/update RLS policies. The two
// JSON textareas are the pragmatic choice over a dynamic list-editor UI for
// a portfolio-scope admin form — still fully functional and validated, just
// less polished than a drag-and-drop builder would be.
export async function upsertService(_state: UpsertServiceState, formData: FormData): Promise<UpsertServiceState> {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return { message: "Not authorized." };

  const validated = ServiceFormSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    slug: formData.get("slug"),
    category: formData.get("category"),
    description: formData.get("description"),
    eligibilityCriteria: formData.get("eligibilityCriteria"),
    requiredDocumentsJson: formData.get("requiredDocumentsJson"),
    faqJson: formData.get("faqJson"),
    applicableDeadlineType: formData.get("applicableDeadlineType"),
    priceDisplay: formData.get("priceDisplay"),
    isActive: formData.get("isActive") || undefined,
  });

  if (!validated.success) {
    return { message: validated.error.issues[0]?.message ?? "Please fix the errors and try again." };
  }

  let requiredDocuments: z.infer<typeof RequiredDocumentSchema>[];
  try {
    requiredDocuments = z.array(RequiredDocumentSchema).parse(JSON.parse(validated.data.requiredDocumentsJson));
  } catch {
    return { message: "Required documents JSON is invalid. Expected an array of {document_type, label, required}." };
  }

  let faq: z.infer<typeof FaqEntrySchema>[];
  try {
    faq = z.array(FaqEntrySchema).parse(JSON.parse(validated.data.faqJson));
  } catch {
    return { message: "FAQ JSON is invalid. Expected an array of {question, answer}." };
  }

  const supabase = await createClient();

  const payload = {
    name: validated.data.name,
    slug: validated.data.slug,
    category: validated.data.category,
    description: validated.data.description,
    eligibility_criteria: validated.data.eligibilityCriteria,
    required_documents: requiredDocuments,
    faq,
    applicable_deadline_type: validated.data.applicableDeadlineType,
    price_display: validated.data.priceDisplay,
    is_active: validated.data.isActive === "on",
  };

  const { error } = validated.data.id
    ? await supabase.from("services").update(payload).eq("id", validated.data.id)
    : await supabase.from("services").insert(payload);

  if (error) return { message: `Could not save service: ${error.message}` };

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath(`/services/${validated.data.slug}`);
  redirect("/admin/services");
}

const DeadlineFormSchema = z.object({
  id: z.string().uuid().optional(),
  assessmentYear: z.string().trim().min(4, "Assessment year is required."),
  filerCategory: z.enum(["individual", "audit", "transfer_pricing"]),
  dueDate: z.string().trim().min(1, "Due date is required."),
  isExtended: z.string().optional(),
  sourceNotificationRef: z.string().trim().optional(),
});

export type UpsertDeadlineState = { message?: string } | undefined;

export async function upsertFilingDeadline(
  _state: UpsertDeadlineState,
  formData: FormData,
): Promise<UpsertDeadlineState> {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return { message: "Not authorized." };

  const validated = DeadlineFormSchema.safeParse({
    id: formData.get("id") || undefined,
    assessmentYear: formData.get("assessmentYear"),
    filerCategory: formData.get("filerCategory"),
    dueDate: formData.get("dueDate"),
    isExtended: formData.get("isExtended") || undefined,
    sourceNotificationRef: formData.get("sourceNotificationRef") || undefined,
  });
  if (!validated.success) {
    return { message: validated.error.issues[0]?.message ?? "Invalid deadline data." };
  }

  const supabase = await createClient();
  const payload = {
    assessment_year: validated.data.assessmentYear,
    filer_category: validated.data.filerCategory,
    due_date: validated.data.dueDate,
    is_extended: validated.data.isExtended === "on",
    source_notification_ref: validated.data.sourceNotificationRef || null,
  };

  const { error } = validated.data.id
    ? await supabase.from("filing_deadlines").update(payload).eq("id", validated.data.id)
    : await supabase.from("filing_deadlines").insert(payload);

  if (error) return { message: `Could not save deadline: ${error.message}` };

  revalidatePath("/admin/deadlines");
  revalidatePath("/services");
  revalidatePath("/admin/analytics");
  return undefined;
}

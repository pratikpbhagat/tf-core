"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";

import { getSessionUser, requireRole } from "@/lib/auth/dal";
import { FILING_STATUS_LABELS, FILING_STATUS_VALUES } from "@/lib/filings/status";
import { notify } from "@/lib/notifications/notify";
import { createClient } from "@/lib/supabase/server";

const CreateFilingSchema = z.object({
  serviceId: z.string().uuid(),
  assessmentYear: z.string().min(4),
});

export type CreateFilingState = { message?: string } | undefined;

export async function createFiling(_state: CreateFilingState, formData: FormData): Promise<CreateFilingState> {
  // Re-checked here even though the page that renders this form is already
  // role-guarded — Server Actions are directly callable and must not rely on
  // the page's guard alone.
  const user = await requireRole("client");

  const validated = CreateFilingSchema.safeParse({
    serviceId: formData.get("serviceId"),
    assessmentYear: formData.get("assessmentYear"),
  });

  if (!validated.success) {
    return { message: "Invalid filing request." };
  }

  const supabase = await createClient();

  const { data: filing, error } = await supabase
    .from("filings")
    .insert({
      client_id: user.id,
      service_id: validated.data.serviceId,
      assessment_year: validated.data.assessmentYear,
    })
    .select("id, tracking_code")
    .single();

  if (error || !filing) {
    return { message: "Could not start this filing. Please try again." };
  }

  // The design doc's notification enum has no dedicated "filing_created"
  // type (see enums.sql) — this is the first status_change, from nothing to
  // "submitted," so it's classified the same as any other transition.
  await notify({
    filingId: filing.id,
    type: "status_change",
    to: user.email,
    subject: "Your TaxFlow India filing has been created",
    html: `<p>Your filing (tracking code <strong>${filing.tracking_code}</strong>) has been submitted. You can track its status anytime, no login required.</p>`,
  });

  redirect(`/dashboard/filings/${filing.id}`);
}

const SetFilingRegimeSchema = z.object({
  filingId: z.string().uuid(),
  regime: z.enum(["old", "new", "undecided"]),
});

export type SetFilingRegimeState = { message?: string } | undefined;

// Thin wrapper around the set_filing_regime() RPC (see functions_triggers.sql):
// the client has no direct UPDATE grant on filings, so this is the one field
// they can change themselves without preparer/admin involvement.
export async function setFilingRegime(
  _state: SetFilingRegimeState,
  formData: FormData,
): Promise<SetFilingRegimeState> {
  const user = await getSessionUser();
  if (!user) return { message: "You must be signed in." };

  const validated = SetFilingRegimeSchema.safeParse({
    filingId: formData.get("filingId"),
    regime: formData.get("regime"),
  });
  if (!validated.success) return { message: "Invalid request." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_filing_regime", {
    p_filing_id: validated.data.filingId,
    p_regime: validated.data.regime,
  });

  if (error) return { message: "Could not update regime. Please try again." };

  revalidatePath(`/dashboard/filings/${validated.data.filingId}`);
  return undefined;
}

const UpdateFilingStatusSchema = z.object({
  filingId: z.string().uuid(),
  status: z.enum(FILING_STATUS_VALUES),
  taxComputed: z.string().optional(),
  refundOrDemand: z.string().optional(),
  regimeComparisonNote: z.string().optional(),
  eVerified: z.string().optional(),
});

export type UpdateFilingStatusState = { message?: string } | undefined;

// Shared by both the preparer and admin filing-detail UIs (see plan §4
// phase 6) — RLS (rls_filings.sql) is what actually restricts this to the
// filing's assigned preparer or an admin; a 0-row update result means "not
// authorized," not "not found."
export async function updateFilingStatus(
  _state: UpdateFilingStatusState,
  formData: FormData,
): Promise<UpdateFilingStatusState> {
  const user = await getSessionUser();
  if (!user || (user.role !== "preparer" && user.role !== "admin")) {
    return { message: "Not authorized." };
  }

  const validated = UpdateFilingStatusSchema.safeParse({
    filingId: formData.get("filingId"),
    status: formData.get("status"),
    taxComputed: formData.get("taxComputed") || undefined,
    refundOrDemand: formData.get("refundOrDemand") || undefined,
    regimeComparisonNote: formData.get("regimeComparisonNote") || undefined,
    eVerified: formData.get("eVerified") || undefined,
  });
  if (!validated.success) return { message: "Invalid request." };

  const { filingId, status, taxComputed, refundOrDemand, regimeComparisonNote, eVerified } = validated.data;

  const parsedTax = taxComputed ? Number(taxComputed) : null;
  const parsedRefund = refundOrDemand ? Number(refundOrDemand) : null;
  if ((taxComputed && Number.isNaN(parsedTax)) || (refundOrDemand && Number.isNaN(parsedRefund))) {
    return { message: "Tax computed and refund/demand must be numbers." };
  }

  const supabase = await createClient();

  const { data: filing, error } = await supabase
    .from("filings")
    .update({
      status,
      tax_computed: parsedTax,
      refund_or_demand: parsedRefund,
      regime_comparison_note: regimeComparisonNote ?? null,
      e_verified: eVerified === "on",
    })
    .eq("id", filingId)
    .select("id, tracking_code, client_id")
    .single();

  if (error || !filing) return { message: "Could not update this filing. You may not have access." };

  const { data: client } = await supabase.from("users").select("email").eq("id", filing.client_id).maybeSingle();
  if (client) {
    const isRefundOrDemand = status === "processed" || status === "demand_raised";
    const isComputationReady = status === "computation_shared_for_approval";
    await notify({
      filingId: filing.id,
      type: isComputationReady ? "computation_ready" : isRefundOrDemand ? "refund_update" : "status_change",
      to: client.email,
      subject: `Update on your filing ${filing.tracking_code}: ${FILING_STATUS_LABELS[status]}`,
      html: `<p>Your filing (${filing.tracking_code}) status is now: <strong>${FILING_STATUS_LABELS[status]}</strong>.</p>`,
    });
  }

  revalidatePath(`/preparer/filings/${filingId}`);
  revalidatePath(`/admin/filings/${filingId}`);
  revalidatePath(`/dashboard/filings/${filingId}`);
  revalidatePath("/dashboard");
  return undefined;
}

const ReassignFilingSchema = z.object({
  filingId: z.string().uuid(),
  preparerId: z.string().uuid(),
});

export type ReassignFilingState = { message?: string } | undefined;

export async function reassignFiling(
  _state: ReassignFilingState,
  formData: FormData,
): Promise<ReassignFilingState> {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return { message: "Not authorized." };

  const validated = ReassignFilingSchema.safeParse({
    filingId: formData.get("filingId"),
    preparerId: formData.get("preparerId"),
  });
  if (!validated.success) return { message: "Invalid request." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("filings")
    .update({ assigned_preparer_id: validated.data.preparerId })
    .eq("id", validated.data.filingId);

  if (error) return { message: "Could not reassign this filing." };

  revalidatePath(`/admin/filings/${validated.data.filingId}`);
  revalidatePath("/admin/dashboard");
  return undefined;
}

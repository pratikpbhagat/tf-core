"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import { getSessionUser } from "@/lib/auth/dal";
import { notify } from "@/lib/notifications/notify";
import { createClient } from "@/lib/supabase/server";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const UploadDocumentSchema = z.object({
  filingId: z.string().uuid(),
  documentType: z.string().min(1),
});

export type UploadDocumentState = { message?: string } | undefined;

export async function uploadDocument(_state: UploadDocumentState, formData: FormData): Promise<UploadDocumentState> {
  const user = await getSessionUser();
  if (!user) return { message: "You must be signed in." };

  const validated = UploadDocumentSchema.safeParse({
    filingId: formData.get("filingId"),
    documentType: formData.get("documentType"),
  });
  if (!validated.success) return { message: "Invalid upload request." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { message: "Choose a file to upload." };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { message: "File must be under 10MB." };
  }

  const { filingId, documentType } = validated.data;
  const supabase = await createClient();

  // RLS also enforces access on every call below; this lookup just gets us
  // assessment_year for the storage path and a friendly "not found" instead
  // of a generic failure if the caller can't see the filing at all.
  const { data: filing } = await supabase
    .from("filings")
    .select("id, assessment_year")
    .eq("id", filingId)
    .maybeSingle();

  if (!filing) return { message: "Filing not found." };

  const { data: existingVersions } = await supabase
    .from("documents")
    .select("version")
    .eq("filing_id", filingId)
    .eq("document_type", documentType)
    .order("version", { ascending: false })
    .limit(1);

  const nextVersion = (existingVersions?.[0]?.version ?? 0) + 1;
  const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const path = `filings/${filingId}/${filing.assessment_year}/${documentType}/${nextVersion}-${safeFileName}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(path, file, { contentType: file.type || "application/octet-stream" });

  if (uploadError) {
    return { message: "Upload failed. Please try again." };
  }

  const { error: insertError } = await supabase.from("documents").insert({
    filing_id: filingId,
    document_type: documentType,
    assessment_year: filing.assessment_year,
    file_path: path,
    version: nextVersion,
    uploaded_by: user.id,
  });

  if (insertError) {
    // The object was written but the row failed — don't leave an orphaned
    // file with no matching database record behind.
    await supabase.storage.from("documents").remove([path]);
    return { message: "Upload failed. Please try again." };
  }

  revalidatePath(`/dashboard/filings/${filingId}`);
  revalidatePath(`/preparer/filings/${filingId}`);
  return undefined;
}

const ReviewDocumentSchema = z.object({
  documentId: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
  reviewerNote: z.string().trim().max(1000).optional(),
});

export type ReviewDocumentState = { message?: string } | undefined;

// Rejecting a document is the "reopen upload" action from the design doc —
// see lib/filings/checklist.ts for why there's no separate "reopened" state.
export async function reviewDocument(_state: ReviewDocumentState, formData: FormData): Promise<ReviewDocumentState> {
  const user = await getSessionUser();
  if (!user || (user.role !== "preparer" && user.role !== "admin")) {
    return { message: "Not authorized." };
  }

  const validated = ReviewDocumentSchema.safeParse({
    documentId: formData.get("documentId"),
    status: formData.get("status"),
    reviewerNote: formData.get("reviewerNote") || undefined,
  });
  if (!validated.success) return { message: "Invalid review request." };

  const supabase = await createClient();

  // No extra ownership check needed here — RLS (rls_documents.sql) only lets
  // this UPDATE through for the filing's assigned preparer or an admin, so a
  // 0-row result already means "not authorized," not just "not found."
  const { data: document, error } = await supabase
    .from("documents")
    .update({ status: validated.data.status, reviewer_note: validated.data.reviewerNote ?? null })
    .eq("id", validated.data.documentId)
    .select("filing_id, document_type")
    .single();

  if (error || !document) {
    return { message: "Could not update this document. You may not have access." };
  }

  // A rejection is the "reopen upload" moment — the client needs to know a
  // document was rejected and needs re-uploading; an approval doesn't need
  // its own notification (the filing's overall status change covers that).
  if (validated.data.status === "rejected") {
    const { data: filing } = await supabase
      .from("filings")
      .select("tracking_code, client_id")
      .eq("id", document.filing_id)
      .single();
    const { data: client } = filing
      ? await supabase.from("users").select("email").eq("id", filing.client_id).maybeSingle()
      : { data: null };

    if (filing && client) {
      await notify({
        filingId: document.filing_id,
        type: "doc_requested",
        to: client.email,
        subject: `Action needed on your filing ${filing.tracking_code}`,
        html: `<p>Your preparer needs you to re-upload <strong>${document.document_type}</strong>${validated.data.reviewerNote ? `: ${validated.data.reviewerNote}` : "."}</p>`,
      });
    }
  }

  revalidatePath(`/preparer/filings/${document.filing_id}`);
  revalidatePath(`/dashboard/filings/${document.filing_id}`);
  return undefined;
}

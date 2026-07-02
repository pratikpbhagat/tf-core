import { notFound } from "next/navigation";

import { ChecklistItemCard } from "@/components/filings/checklist-item-card";
import { ComputationSummary } from "@/components/filings/computation-summary";
import { DownloadCenter } from "@/components/filings/download-center";
import { MessageForm } from "@/components/filings/message-form";
import { MessagesThread } from "@/components/filings/messages-thread";
import { ReviewDocumentControls } from "@/components/filings/review-document-controls";
import { StatusTimeline } from "@/components/filings/status-timeline";
import { StatusUpdateForm } from "@/components/filings/status-update-form";
import { UploadDocumentForm } from "@/components/filings/upload-document-form";
import { getSessionUser } from "@/lib/auth/dal";
import { deriveChecklist, type RequiredDocument } from "@/lib/filings/checklist";
import { OUTPUT_DOCUMENT_TYPES } from "@/lib/filings/output-documents";
import { FILING_STATUS_LABELS } from "@/lib/filings/status";
import { getSignedDocumentUrl } from "@/lib/storage/signed-url";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

export default async function PreparerFilingDetailPage({ params }: Props) {
  const { id } = await params;

  const user = await getSessionUser();
  if (!user) notFound();

  const supabase = await createClient();

  // Firm-wide select policy (see rls_filings.sql) means any preparer can
  // view this; only the assigned preparer's UPDATEs actually succeed, which
  // is why the review/status controls below are further gated on assignment.
  const { data: filing } = await supabase
    .from("filings")
    .select(
      "id, tracking_code, status, assessment_year, assigned_preparer_id, client_id, service_id, regime_selected, regime_comparison_note, tax_computed, refund_or_demand, e_verified",
    )
    .eq("id", id)
    .maybeSingle();

  if (!filing) notFound();

  const { data: client } = await supabase.from("users").select("name, email").eq("id", filing.client_id).single();

  const { data: service } = await supabase
    .from("services")
    .select("name, required_documents")
    .eq("id", filing.service_id)
    .single();

  const { data: documents } = await supabase
    .from("documents")
    .select("id, document_type, version, status, file_path, reviewer_note, created_at")
    .eq("filing_id", id);

  const requiredDocuments = (service?.required_documents as unknown as RequiredDocument[]) ?? [];
  const checklist = deriveChecklist(requiredDocuments, documents ?? []);

  const checklistWithUrls = await Promise.all(
    checklist.map(async (item) => ({
      ...item,
      signedUrl: item.latestDocument ? await getSignedDocumentUrl(supabase, item.latestDocument.file_path) : null,
    })),
  );

  const allDocuments = documents ?? [];
  const outputDocuments = OUTPUT_DOCUMENT_TYPES.map(({ type, label }) => {
    const latest = allDocuments
      .filter((doc) => doc.document_type === type)
      .reduce<(typeof allDocuments)[number] | null>((latest, current) => {
        if (!latest || current.version > latest.version) return current;
        return latest;
      }, null);
    return { type, label, filePath: latest?.file_path ?? null };
  });

  const downloadItems = await Promise.all(
    outputDocuments.map(async ({ label, filePath }) => ({
      label,
      signedUrl: filePath ? await getSignedDocumentUrl(supabase, filePath) : null,
    })),
  );

  // No is_client_visible filter here — preparer/admin RLS already grants
  // access to every history row and message, internal-only ones included.
  const { data: statusHistory } = await supabase
    .from("filing_status_history")
    .select("status, note, created_at")
    .eq("filing_id", id)
    .order("created_at", { ascending: true });

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, message, is_internal, created_at")
    .eq("filing_id", id)
    .order("created_at", { ascending: true });

  const senderIds = [...new Set((messages ?? []).map((message) => message.sender_id))];
  const { data: senders } =
    senderIds.length > 0 ? await supabase.from("users").select("id, name").in("id", senderIds) : { data: [] };
  const senderNameById = new Map((senders ?? []).map((sender) => [sender.id, sender.name]));

  const messageEntries = (messages ?? []).map((message) => ({
    id: message.id,
    message: message.message,
    created_at: message.created_at,
    senderName: senderNameById.get(message.sender_id) ?? "Client",
    isOwn: message.sender_id === user.id,
    isInternal: message.is_internal,
  }));

  const canReview = filing.assigned_preparer_id === user.id;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12">
      <div>
        <p className="text-sm text-zinc-500">{filing.tracking_code}</p>
        <h1 className="text-2xl font-semibold">{service?.name}</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {client?.name} ({client?.email}) — AY {filing.assessment_year} —{" "}
          {FILING_STATUS_LABELS[filing.status] ?? filing.status}
        </p>
        {!canReview && (
          <p className="mt-2 text-xs text-amber-600">
            You&apos;re viewing this filing firm-wide — it&apos;s assigned to a different preparer, so review and
            status actions are disabled here.
          </p>
        )}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Computation summary</h2>
        <ComputationSummary
          regimeSelected={filing.regime_selected}
          regimeComparisonNote={filing.regime_comparison_note}
          taxComputed={filing.tax_computed}
          refundOrDemand={filing.refund_or_demand}
        />
        {canReview && (
          <StatusUpdateForm
            filingId={filing.id}
            currentStatus={filing.status}
            currentTaxComputed={filing.tax_computed}
            currentRefundOrDemand={filing.refund_or_demand}
            currentRegimeComparisonNote={filing.regime_comparison_note}
            currentEVerified={filing.e_verified}
          />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Documents</h2>
        {checklistWithUrls.map((item) => (
          <ChecklistItemCard key={item.documentType} item={item} signedUrl={item.signedUrl}>
            {canReview && item.status === "pending" && item.latestDocument && (
              <ReviewDocumentControls documentId={item.latestDocument.id} />
            )}
          </ChecklistItemCard>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Output documents</h2>
        {outputDocuments.map(({ type, label }, index) => (
          <div key={type} className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{label}</p>
              {downloadItems[index]?.signedUrl && (
                <a
                  href={downloadItems[index].signedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium underline"
                >
                  View current file
                </a>
              )}
            </div>
            {canReview && <UploadDocumentForm filingId={filing.id} documentType={type} />}
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Downloads (client view)</h2>
        <DownloadCenter items={downloadItems} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Status timeline</h2>
        <StatusTimeline entries={statusHistory ?? []} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Messages</h2>
        <MessagesThread messages={messageEntries} />
        <MessageForm filingId={filing.id} allowInternal />
      </section>
    </div>
  );
}

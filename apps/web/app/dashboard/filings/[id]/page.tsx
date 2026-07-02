import { notFound } from "next/navigation";

import { ChecklistItemCard } from "@/components/filings/checklist-item-card";
import { ComputationSummary } from "@/components/filings/computation-summary";
import { DownloadCenter } from "@/components/filings/download-center";
import { MessageForm } from "@/components/filings/message-form";
import { MessagesThread } from "@/components/filings/messages-thread";
import { StatusBadge } from "@/components/filings/status-badge";
import { StatusTimeline } from "@/components/filings/status-timeline";
import { UploadDocumentForm } from "@/components/filings/upload-document-form";
import { Card } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth/dal";
import { deriveChecklist, type RequiredDocument } from "@/lib/filings/checklist";
import { OUTPUT_DOCUMENT_TYPES } from "@/lib/filings/output-documents";
import { getSignedDocumentUrl } from "@/lib/storage/signed-url";
import { createClient } from "@/lib/supabase/server";

import { RegimeForm } from "./regime-form";

type Props = { params: Promise<{ id: string }> };

export default async function ClientFilingDetailPage({ params }: Props) {
  const { id } = await params;

  const user = await getSessionUser();
  if (!user) notFound();

  const supabase = await createClient();

  const { data: filing } = await supabase
    .from("filings")
    .select(
      "id, tracking_code, status, assessment_year, client_id, service_id, regime_selected, regime_comparison_note, tax_computed, refund_or_demand",
    )
    .eq("id", id)
    .maybeSingle();

  // RLS already restricts this, but confirm ownership explicitly too, per
  // the "recheck in the action/page, don't rely on RLS alone" principle.
  if (!filing || filing.client_id !== user.id) notFound();

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
      signedUrl: filePath ? await getSignedDocumentUrl(supabase, filePath, 600, { download: label }) : null,
    })),
  );

  const { data: statusHistory } = await supabase
    .from("filing_status_history")
    .select("status, note, created_at")
    .eq("filing_id", id)
    .eq("is_client_visible", true)
    .order("created_at", { ascending: true });

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, message, created_at")
    .eq("filing_id", id)
    .eq("is_internal", false)
    .order("created_at", { ascending: true });

  const senderIds = [...new Set((messages ?? []).map((message) => message.sender_id))];
  const { data: senders } =
    senderIds.length > 0 ? await supabase.from("users").select("id, name").in("id", senderIds) : { data: [] };
  const senderNameById = new Map((senders ?? []).map((sender) => [sender.id, sender.name]));

  const messageEntries = (messages ?? []).map((message) => ({
    id: message.id,
    message: message.message,
    created_at: message.created_at,
    senderName: senderNameById.get(message.sender_id) ?? "Preparer",
    isOwn: message.sender_id === user.id,
  }));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{filing.tracking_code}</p>
          <h1 className="text-2xl font-semibold">{service?.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">AY {filing.assessment_year}</p>
        </div>
        <StatusBadge status={filing.status} />
      </div>

      <Card className="flex flex-col gap-3 p-5">
        <h2 className="text-lg font-medium">Computation summary</h2>
        <ComputationSummary
          regimeSelected={filing.regime_selected}
          regimeComparisonNote={filing.regime_comparison_note}
          taxComputed={filing.tax_computed}
          refundOrDemand={filing.refund_or_demand}
          regimeControls={<RegimeForm filingId={filing.id} currentRegime={filing.regime_selected} />}
        />
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Documents</h2>
        {checklistWithUrls.map((item) => (
          <ChecklistItemCard key={item.documentType} item={item} signedUrl={item.signedUrl}>
            {item.canUpload && <UploadDocumentForm filingId={filing.id} documentType={item.documentType} />}
          </ChecklistItemCard>
        ))}
      </section>

      <Card className="flex flex-col gap-3 p-5">
        <h2 className="text-lg font-medium">Downloads</h2>
        <DownloadCenter items={downloadItems} />
      </Card>

      <Card className="flex flex-col gap-3 p-5">
        <h2 className="text-lg font-medium">Status timeline</h2>
        <StatusTimeline entries={statusHistory ?? []} />
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Messages</h2>
        <MessagesThread messages={messageEntries} />
        <MessageForm filingId={filing.id} />
      </section>
    </div>
  );
}

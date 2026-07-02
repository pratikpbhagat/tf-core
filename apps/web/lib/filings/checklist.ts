import type { DocumentStatus } from "@tf-core/db";

export type RequiredDocument = {
  document_type: string;
  label: string;
  required: boolean;
};

export type UploadedDocument = {
  id: string;
  document_type: string;
  version: number;
  status: DocumentStatus;
  file_path: string;
  reviewer_note: string | null;
  created_at: string;
};

export type ChecklistItemStatus = "missing" | DocumentStatus;

export type ChecklistItem = {
  documentType: string;
  label: string;
  required: boolean;
  status: ChecklistItemStatus;
  latestDocument: UploadedDocument | null;
  // True when there's no current upload, or the latest one was rejected —
  // i.e. exactly the cases where a client should be able to (re-)upload.
  // A preparer rejecting a document IS the "reopen upload" mechanism from
  // the design doc: there's no separate "reopened" state to track.
  canUpload: boolean;
};

export function deriveChecklist(
  requiredDocuments: RequiredDocument[],
  uploadedDocuments: UploadedDocument[],
): ChecklistItem[] {
  return requiredDocuments.map((doc) => {
    const latest = uploadedDocuments
      .filter((upload) => upload.document_type === doc.document_type)
      .reduce<UploadedDocument | null>((latest, current) => {
        if (!latest || current.version > latest.version) return current;
        return latest;
      }, null);

    const status: ChecklistItemStatus = latest ? latest.status : "missing";

    return {
      documentType: doc.document_type,
      label: doc.label,
      required: doc.required,
      status,
      latestDocument: latest,
      canUpload: status === "missing" || status === "rejected",
    };
  });
}

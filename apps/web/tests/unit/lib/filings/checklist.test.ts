import { describe, expect, it } from "vitest";

import { deriveChecklist, type RequiredDocument, type UploadedDocument } from "@/lib/filings/checklist";

function upload(overrides: Partial<UploadedDocument> = {}): UploadedDocument {
  return {
    id: "doc-1",
    document_type: "pan_card",
    version: 1,
    status: "pending",
    file_path: "filings/f/2025-26/pan_card/1-pan.pdf",
    reviewer_note: null,
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

const REQUIRED_DOCS: RequiredDocument[] = [
  { document_type: "pan_card", label: "PAN Card", required: true },
  { document_type: "aadhaar_card", label: "Aadhaar Card", required: true },
  { document_type: "investment_proof_80c", label: "80C Investment Proofs", required: false },
];

describe("deriveChecklist", () => {
  it("marks every item missing and uploadable when nothing has been uploaded", () => {
    const checklist = deriveChecklist(REQUIRED_DOCS, []);

    expect(checklist).toHaveLength(3);
    for (const item of checklist) {
      expect(item.status).toBe("missing");
      expect(item.canUpload).toBe(true);
      expect(item.latestDocument).toBeNull();
    }
  });

  it("returns an empty checklist when the service requires no documents", () => {
    expect(deriveChecklist([], [upload()])).toEqual([]);
  });

  it("reflects the uploaded document's status for a matching type", () => {
    const uploads = [upload({ document_type: "pan_card", status: "approved" })];
    const checklist = deriveChecklist(REQUIRED_DOCS, uploads);

    const panItem = checklist.find((item) => item.documentType === "pan_card");
    expect(panItem?.status).toBe("approved");
    expect(panItem?.canUpload).toBe(false);
    expect(panItem?.latestDocument?.status).toBe("approved");
  });

  it("treats a rejected document as uploadable again (the reopen mechanism)", () => {
    const uploads = [upload({ document_type: "aadhaar_card", status: "rejected", reviewer_note: "Blurry scan" })];
    const checklist = deriveChecklist(REQUIRED_DOCS, uploads);

    const aadhaarItem = checklist.find((item) => item.documentType === "aadhaar_card");
    expect(aadhaarItem?.status).toBe("rejected");
    expect(aadhaarItem?.canUpload).toBe(true);
    expect(aadhaarItem?.latestDocument?.reviewer_note).toBe("Blurry scan");
  });

  it("uses the highest version when multiple uploads exist for the same document type", () => {
    const uploads = [
      upload({ id: "v1", document_type: "pan_card", version: 1, status: "rejected" }),
      upload({ id: "v2", document_type: "pan_card", version: 2, status: "pending" }),
    ];
    const checklist = deriveChecklist(REQUIRED_DOCS, uploads);

    const panItem = checklist.find((item) => item.documentType === "pan_card");
    expect(panItem?.latestDocument?.id).toBe("v2");
    expect(panItem?.status).toBe("pending");
  });

  it("ignores uploads whose document type isn't part of this service's checklist", () => {
    const uploads = [upload({ document_type: "gst_returns_prior" })];
    const checklist = deriveChecklist(REQUIRED_DOCS, uploads);

    expect(checklist.every((item) => item.status === "missing")).toBe(true);
  });

  it("preserves optional documents as not-required but still tracked", () => {
    const checklist = deriveChecklist(REQUIRED_DOCS, []);
    const optionalItem = checklist.find((item) => item.documentType === "investment_proof_80c");
    expect(optionalItem?.required).toBe(false);
  });
});

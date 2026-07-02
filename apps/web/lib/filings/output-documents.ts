// Preparer-generated deliverables shown in the client's download center —
// distinct from services.required_documents, which are client-uploaded
// intake documents. Phase 6's preparer UI will reuse this same list to
// upload against these document_type values via the existing generic
// uploadDocument action.
export const OUTPUT_DOCUMENT_TYPES = [
  { type: "computation_sheet", label: "Computation Sheet" },
  { type: "filed_itr_copy", label: "Filed ITR Copy" },
  { type: "itr_v_acknowledgment", label: "ITR-V Acknowledgment" },
] as const;

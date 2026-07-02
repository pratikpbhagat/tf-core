import type { FilingStatus } from "@tf-core/db";

// Order matters here: this is the pipeline sequence from the design doc, and
// status-update <select> options (see status-update-form.tsx) render in this
// order. Also the single source of truth for the zod enum in
// actions/filings.ts's updateFilingStatus, so the DB enum, the validator,
// and the UI options can't drift from each other.
export const FILING_STATUS_VALUES = [
  "submitted",
  "documents_under_review",
  "additional_info_needed",
  "tax_computation_in_progress",
  "computation_shared_for_approval",
  "filed_on_portal",
  "itr_v_generated",
  "e_verified",
  "processed",
  "demand_raised",
] as const satisfies readonly FilingStatus[];

export const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  submitted: "Submitted",
  documents_under_review: "Documents under review",
  additional_info_needed: "Additional info needed",
  tax_computation_in_progress: "Tax computation in progress",
  computation_shared_for_approval: "Computation shared for approval",
  filed_on_portal: "Filed on portal",
  itr_v_generated: "ITR-V generated",
  e_verified: "E-verified",
  processed: "Processed",
  demand_raised: "Demand raised",
};

// A filing in one of these states is fully closed out — excluded from
// preparer workload counts (staff page) and from the deadline-risk view
// (admin analytics), since there's nothing left to act on.
export const TERMINAL_FILING_STATUSES: readonly FilingStatus[] = ["processed", "demand_raised"];

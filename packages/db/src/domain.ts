import type { Database } from "./types";

export type FilingStatus = Database["public"]["Enums"]["filing_status"];
export type UserRole = Database["public"]["Enums"]["user_role"];
export type RegimeType = Database["public"]["Enums"]["regime_type"];
export type DocumentStatus = Database["public"]["Enums"]["document_status"];
export type FilerCategory = Database["public"]["Enums"]["filer_category"];
export type NotificationChannel = Database["public"]["Enums"]["notification_channel"];
export type NotificationType = Database["public"]["Enums"]["notification_type"];

export const FILING_STATUS_ORDER: FilingStatus[] = [
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
];

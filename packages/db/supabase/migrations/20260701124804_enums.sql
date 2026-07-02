-- Core domain enums.

create type public.user_role as enum ('client', 'preparer', 'admin');

create type public.filing_status as enum (
  'submitted',
  'documents_under_review',
  'additional_info_needed',
  'tax_computation_in_progress',
  'computation_shared_for_approval',
  'filed_on_portal',
  'itr_v_generated',
  'e_verified',
  'processed',
  'demand_raised'
);

create type public.regime_type as enum ('old', 'new', 'undecided');

create type public.document_status as enum ('pending', 'approved', 'rejected');

-- Drives which row of filing_deadlines applies to a given filing.
create type public.filer_category as enum ('individual', 'audit', 'transfer_pricing');

create type public.notification_channel as enum ('email', 'sms');

create type public.notification_type as enum (
  'status_change',
  'doc_requested',
  'computation_ready',
  'deadline_reminder',
  'e_verify_reminder',
  'refund_update'
);

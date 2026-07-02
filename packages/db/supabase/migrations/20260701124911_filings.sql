-- A "filing" (case) = one Assessment Year + one service (ITR type) for one client.
-- RLS is enabled here (default-deny) but policies are defined in the
-- dedicated rls_filings migration, kept separate so access-rule changes are
-- independently reviewable from schema changes.

create table public.filings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.users (id),
  service_id uuid not null references public.services (id),
  assessment_year text not null,
  -- Public-facing lookup code for the unauthenticated status tracker.
  -- Random, not sequential, to resist enumeration. Populated by a trigger
  -- (see functions_triggers migration), not left nullable to the app.
  tracking_code text not null unique,
  status public.filing_status not null default 'submitted',
  assigned_preparer_id uuid references public.users (id),
  regime_selected public.regime_type not null default 'undecided',
  regime_comparison_note text,
  tax_computed numeric(14, 2),
  -- Positive = refund, negative = demand.
  refund_or_demand numeric(14, 2),
  e_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index filings_client_id_idx on public.filings (client_id);
create index filings_assigned_preparer_id_idx on public.filings (assigned_preparer_id);
create index filings_status_idx on public.filings (status);
create index filings_assessment_year_idx on public.filings (assessment_year);

alter table public.filings enable row level security;

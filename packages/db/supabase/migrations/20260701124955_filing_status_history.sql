-- Append-only audit trail of status transitions on a filing. Rows are
-- inserted exclusively by the trigger defined in functions_triggers.sql,
-- never directly by application code, so the history can't drift from
-- filings.status.

create table public.filing_status_history (
  id uuid primary key default gen_random_uuid(),
  filing_id uuid not null references public.filings (id) on delete cascade,
  status public.filing_status not null,
  changed_by uuid references public.users (id),
  note text,
  -- If false, the note is preparer/admin-internal and must never render on
  -- the client dashboard or the public tracker.
  is_client_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create index filing_status_history_filing_id_idx on public.filing_status_history (filing_id);

alter table public.filing_status_history enable row level security;

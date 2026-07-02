-- Per-filing message thread between client and preparer/admin.

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  filing_id uuid not null references public.filings (id) on delete cascade,
  sender_id uuid not null references public.users (id),
  message text not null,
  -- Internal notes between preparer/admin are never visible to the client.
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);

create index messages_filing_id_idx on public.messages (filing_id);

alter table public.messages enable row level security;

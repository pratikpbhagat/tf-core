-- Record of every notification sent, used both for delivery auditing and for
-- idempotency (e.g. don't send the same 7-day deadline reminder twice).

create table public.notifications_log (
  id uuid primary key default gen_random_uuid(),
  filing_id uuid references public.filings (id) on delete cascade,
  type public.notification_type not null,
  sent_to text not null,
  channel public.notification_channel not null default 'email',
  -- Free-form key used for idempotency checks, e.g. "deadline_reminder:7" so a
  -- given threshold is matched against exactly once per filing.
  dedupe_key text,
  sent_at timestamptz not null default now()
);

create index notifications_log_filing_id_idx on public.notifications_log (filing_id);
create unique index notifications_log_dedupe_idx
  on public.notifications_log (filing_id, dedupe_key)
  where dedupe_key is not null;

alter table public.notifications_log enable row level security;

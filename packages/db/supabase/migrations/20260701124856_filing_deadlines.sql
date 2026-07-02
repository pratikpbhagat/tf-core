-- Deadlines as data: kept separate from services so the annual CBDT
-- notification (and any extension) is a data update, not a code deploy.

create table public.filing_deadlines (
  id uuid primary key default gen_random_uuid(),
  assessment_year text not null,
  filer_category public.filer_category not null,
  due_date date not null,
  is_extended boolean not null default false,
  source_notification_ref text,
  -- Portfolio content, not authoritative tax guidance until verified.
  is_illustrative boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assessment_year, filer_category)
);

alter table public.filing_deadlines enable row level security;

create policy "filing_deadlines_public_select" on public.filing_deadlines
  for select using (true);

create policy "filing_deadlines_admin_insert" on public.filing_deadlines
  for insert with check (public.is_admin());

create policy "filing_deadlines_admin_update" on public.filing_deadlines
  for update using (public.is_admin()) with check (public.is_admin());

create policy "filing_deadlines_admin_delete" on public.filing_deadlines
  for delete using (public.is_admin());

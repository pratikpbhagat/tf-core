-- Public-facing service catalog (ITR types, TDS/GST filing, notice response, etc).
-- Public read, admin-only write (see rls_services policies below).

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null,
  description text not null,
  eligibility_criteria text not null,
  -- Array of { document_type, label, required } objects. Drives the dynamic
  -- checklist rendered per filing (see lib/filings/checklist.ts).
  required_documents jsonb not null default '[]'::jsonb,
  applicable_deadline_type public.filer_category not null default 'individual',
  price_display text not null,
  -- Demo/portfolio content is explicitly flagged so the UI can render an
  -- "illustrative, not tax advice" disclaimer wherever it's shown.
  is_illustrative boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.services enable row level security;

create policy "services_public_select" on public.services
  for select using (is_active or public.is_admin());

create policy "services_admin_insert" on public.services
  for insert with check (public.is_admin());

create policy "services_admin_update" on public.services
  for update using (public.is_admin()) with check (public.is_admin());

create policy "services_admin_delete" on public.services
  for delete using (public.is_admin());

-- RLS policies for public.users. Kept separate from the table's own
-- migration so access-rule changes are independently reviewable from schema
-- changes.

alter table public.users enable row level security;

create policy "users_self_select" on public.users
  for select using (auth.uid() = id);

-- Preparers get firm-wide read on users (mirrors the firm-wide filing
-- visibility trade-off in rls_filings) so they can see client name/contact
-- details across any filing, not just ones assigned to them.
create policy "users_preparer_select" on public.users
  for select using (public.is_preparer());

create policy "users_admin_select" on public.users
  for select using (public.is_admin());

create policy "users_self_update" on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "users_admin_update" on public.users
  for update using (public.is_admin()) with check (public.is_admin());

-- Row creation happens exclusively via the handle_new_auth_user() trigger
-- (security definer, bypasses RLS) — no direct client INSERT policy.
create policy "users_admin_delete" on public.users
  for delete using (public.is_admin());

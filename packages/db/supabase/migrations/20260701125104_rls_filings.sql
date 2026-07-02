-- RLS policies for public.filings.
--
-- v1 trade-off: preparers get FIRM-WIDE select (not scoped to
-- assigned_preparer_id) because small CA firms routinely cover for each
-- other and hand off cases; a strictly per-assignment read policy would
-- block that normal collaboration and force an admin to intervene for every
-- reassignment-adjacent read. Write access (UPDATE) stays assignment-scoped,
-- and only an admin can change assigned_preparer_id itself. Revisit if
-- multi-firm tenancy is ever introduced.
--
-- Clients get no UPDATE policy at all on this table: status changes are
-- preparer/admin actions, and the one client-editable field (regime_selected)
-- goes through the set_filing_regime() RPC in functions_triggers.sql instead
-- of a direct column-level grant, since Supabase's "authenticated" Postgres
-- role is shared by clients and preparers alike (role distinction lives in
-- public.users.role, not a separate Postgres role), so column-level GRANTs
-- can't distinguish between them the way RLS predicates can.

create policy "filings_client_select" on public.filings
  for select using (client_id = auth.uid());

create policy "filings_preparer_select" on public.filings
  for select using (public.is_preparer());

create policy "filings_admin_select" on public.filings
  for select using (public.is_admin());

create policy "filings_client_insert" on public.filings
  for insert with check (client_id = auth.uid());

create policy "filings_admin_insert" on public.filings
  for insert with check (public.is_admin());

create policy "filings_preparer_update" on public.filings
  for update
  using (public.is_preparer() and assigned_preparer_id = auth.uid())
  with check (assigned_preparer_id = auth.uid());

create policy "filings_admin_update" on public.filings
  for update using (public.is_admin()) with check (public.is_admin());

create policy "filings_admin_delete" on public.filings
  for delete using (public.is_admin());

-- Shared by rls_documents and rls_messages (and the storage.objects policies
-- on the "documents" bucket) so "can this caller touch this filing's
-- child records" is defined once, matching the select policies above.
create function public.can_access_filing(p_filing_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.filings f
    where f.id = p_filing_id
      and (f.client_id = auth.uid() or public.is_preparer() or public.is_admin())
  );
$$;

-- filing_status_history has no dedicated rls_* migration of its own since it
-- has no independent access model — visibility always follows the parent
-- filing, with is_client_visible additionally hiding internal notes from
-- clients. Rows are inserted only by the trigger in functions_triggers.sql,
-- never directly, so there is no INSERT policy for any role.
create policy "filing_status_history_client_select" on public.filing_status_history
  for select using (
    is_client_visible = true
    and exists (
      select 1 from public.filings f
      where f.id = filing_id and f.client_id = auth.uid()
    )
  );

create policy "filing_status_history_preparer_select" on public.filing_status_history
  for select using (public.is_preparer());

create policy "filing_status_history_admin_select" on public.filing_status_history
  for select using (public.is_admin());

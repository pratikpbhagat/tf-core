-- RLS policies for public.messages. Clients only ever see non-internal
-- messages on their own filings; preparers/admins see everything (firm-wide,
-- matching the same v1 trade-off as filings/documents). RLS itself was
-- already enabled in the messages.sql creation migration.

create policy "messages_client_select" on public.messages
  for select using (
    is_internal = false
    and exists (
      select 1 from public.filings f
      where f.id = filing_id and f.client_id = auth.uid()
    )
  );

create policy "messages_preparer_select" on public.messages
  for select using (public.is_preparer());

create policy "messages_admin_select" on public.messages
  for select using (public.is_admin());

create policy "messages_client_insert" on public.messages
  for insert
  with check (
    sender_id = auth.uid()
    and is_internal = false
    and exists (
      select 1 from public.filings f
      where f.id = filing_id and f.client_id = auth.uid()
    )
  );

create policy "messages_preparer_insert" on public.messages
  for insert with check (sender_id = auth.uid() and public.is_preparer());

create policy "messages_admin_insert" on public.messages
  for insert with check (sender_id = auth.uid() and public.is_admin());

create policy "messages_admin_delete" on public.messages
  for delete using (public.is_admin());

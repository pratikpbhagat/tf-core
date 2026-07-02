-- RLS policies for public.documents plus the matching storage.objects
-- policies on the "documents" bucket, so table-row access and file-object
-- access stay in lock-step (both keyed off can_access_filing()).

create policy "documents_select" on public.documents
  for select using (public.can_access_filing(filing_id));

create policy "documents_client_insert" on public.documents
  for insert
  with check (
    uploaded_by = auth.uid()
    and exists (
      select 1 from public.filings f
      where f.id = filing_id and f.client_id = auth.uid()
    )
  );

create policy "documents_preparer_insert" on public.documents
  for insert
  with check (uploaded_by = auth.uid() and public.is_preparer());

create policy "documents_admin_insert" on public.documents
  for insert with check (public.is_admin());

-- Review actions (approve/reject/reviewer_note) are preparer/admin only.
create policy "documents_preparer_update" on public.documents
  for update
  using (
    public.is_preparer()
    and exists (
      select 1 from public.filings f
      where f.id = filing_id and f.assigned_preparer_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.filings f
      where f.id = filing_id and f.assigned_preparer_id = auth.uid()
    )
  );

create policy "documents_admin_update" on public.documents
  for update using (public.is_admin()) with check (public.is_admin());

create policy "documents_admin_delete" on public.documents
  for delete using (public.is_admin());

-- Storage: path convention is filings/{filing_id}/{assessment_year}/{document_type}/{version}-{filename}.
-- storage.foldername(name) splits the object path into segments; segment 2 is the filing_id.
create policy "documents_bucket_select" on storage.objects
  for select using (
    bucket_id = 'documents'
    and public.can_access_filing((storage.foldername(name))[2]::uuid)
  );

create policy "documents_bucket_insert" on storage.objects
  for insert
  with check (
    bucket_id = 'documents'
    and public.can_access_filing((storage.foldername(name))[2]::uuid)
  );

create policy "documents_bucket_admin_delete" on storage.objects
  for delete using (bucket_id = 'documents' and public.is_admin());

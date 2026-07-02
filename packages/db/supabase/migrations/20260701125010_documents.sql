-- Document metadata + the private Storage bucket that holds the files
-- themselves. document_type is free-form text (not an enum) because the set
-- of required documents is data-driven per service (services.required_documents),
-- not fixed at the schema level.

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  filing_id uuid not null references public.filings (id) on delete cascade,
  document_type text not null,
  assessment_year text not null,
  -- Storage object path: filings/{filing_id}/{assessment_year}/{document_type}/{version}-{filename}
  file_path text not null,
  version integer not null default 1,
  uploaded_by uuid not null references public.users (id),
  status public.document_status not null default 'pending',
  reviewer_note text,
  created_at timestamptz not null default now()
);

create index documents_filing_id_idx on public.documents (filing_id);
create index documents_document_type_idx on public.documents (filing_id, document_type);

alter table public.documents enable row level security;

-- Private bucket: every read/write goes through signed URLs generated
-- server-side, never a public bucket URL, given how sensitive these files are
-- (PAN/Aadhaar/Form 16/bank statements).
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

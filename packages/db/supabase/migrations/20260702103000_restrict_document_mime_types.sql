-- Defense in depth alongside the ALLOWED_MIME_TYPES check in
-- actions/documents.ts: restrict the "documents" bucket itself to PDF/JPEG/
-- PNG and a 10MB cap, so the restriction holds even if a future call site
-- writes to this bucket without going through that action.
update storage.buckets
set allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png'],
    file_size_limit = 10485760
where id = 'documents';

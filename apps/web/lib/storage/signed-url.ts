import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@tf-core/db";

// The "documents" bucket is private — every read goes through a short-lived
// signed URL, generated with the caller's own authenticated client so
// storage RLS (see rls_documents.sql) still applies. Never a public bucket
// URL, given how sensitive these files are (PAN/Aadhaar/Form 16/bank docs).
export async function getSignedDocumentUrl(
  supabase: SupabaseClient<Database>,
  path: string,
  expiresInSeconds = 600,
  // When set, Supabase Storage responds with Content-Disposition: attachment
  // (server-set, so it applies regardless of the browser's cross-origin
  // handling of the anchor `download` attribute) — used for the Download
  // Center's finished outputs, which should save rather than render inline.
  options?: { download?: string },
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(path, expiresInSeconds, options?.download ? { download: options.download } : undefined);
  if (error || !data) return null;
  return data.signedUrl;
}

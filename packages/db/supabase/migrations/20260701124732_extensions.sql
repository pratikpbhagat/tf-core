-- Extensions required across the schema.
-- pgcrypto: used for gen_random_uuid() PKs and pgp_sym_encrypt/decrypt (PAN/Aadhaar at rest, see sensitive_identity migration).
create extension if not exists "pgcrypto" with schema "extensions";

-- Supabase Vault: holds the symmetric key used to encrypt/decrypt PAN/Aadhaar,
-- so the key itself never lives in a migration file or application env var.
-- Bundled with the Supabase local dev stack; the actual secret is seeded
-- separately (see packages/db/README) since secrets don't belong in
-- version-controlled SQL.
create extension if not exists "supabase_vault";

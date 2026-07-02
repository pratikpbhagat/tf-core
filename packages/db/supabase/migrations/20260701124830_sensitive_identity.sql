-- Role helper functions, reused by every RLS policy from here on so the role
-- lookup logic exists in exactly one place.

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  );
$$;

create function public.is_preparer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'preparer'
  );
$$;

-- PAN/Aadhaar are held separately from public.users so that the much wider
-- set of "who can read a user's name/role" policies never has a path to
-- plaintext/decryptable identity numbers.
create table public.user_sensitive_identity (
  user_id uuid primary key references public.users (id) on delete cascade,
  pan_encrypted bytea,
  -- Deterministic hash of the PAN (not the encryption key) so admins can do
  -- exact-match lookups (search) without ever decrypting a row. See §9 search.
  pan_hash text,
  aadhaar_encrypted bytea,
  encryption_key_version smallint not null default 1,
  updated_at timestamptz not null default now()
);

comment on table public.user_sensitive_identity is 'PAN/Aadhaar at rest, encrypted via pgcrypto with the key stored in Supabase Vault. Decrypt only through the audited get_full_pan()/get_full_aadhaar() RPCs, never via direct SELECT.';

create unique index user_sensitive_identity_pan_hash_idx
  on public.user_sensitive_identity (pan_hash)
  where pan_hash is not null;

alter table public.user_sensitive_identity enable row level security;

-- Deliberately no preparer policy: preparers never get direct table access to
-- PAN/Aadhaar, only the audited reveal RPC (see public_tracker_rpc-adjacent
-- functions_triggers migration).
create policy "sensitive_self_select" on public.user_sensitive_identity
  for select using (auth.uid() = user_id);

create policy "sensitive_admin_all" on public.user_sensitive_identity
  for all using (public.is_admin()) with check (public.is_admin());

-- Records every read of a sensitive identifier (PAN/Aadhaar) for compliance.
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users (id),
  action text not null,
  target_table text not null,
  target_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;

-- Only admins can read the audit trail. Inserts happen exclusively through
-- security definer functions (e.g. get_full_pan), never directly from clients.
create policy "audit_log_admin_select" on public.audit_log
  for select using (public.is_admin());

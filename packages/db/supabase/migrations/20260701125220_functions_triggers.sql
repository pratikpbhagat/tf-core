-- Generic updated_at maintenance, tracking-code generation, the
-- status-history trigger, and the sensitive-identity read/write RPCs.

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at before update on public.users
  for each row execute function public.set_updated_at();
create trigger services_set_updated_at before update on public.services
  for each row execute function public.set_updated_at();
create trigger filing_deadlines_set_updated_at before update on public.filing_deadlines
  for each row execute function public.set_updated_at();
create trigger filings_set_updated_at before update on public.filings
  for each row execute function public.set_updated_at();
create trigger user_sensitive_identity_set_updated_at before update on public.user_sensitive_identity
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Tracking code generation
-- ---------------------------------------------------------------------------

-- Random (not sequential) so the public tracker can't be enumerated. Set as
-- a column DEFAULT rather than a BEFORE INSERT trigger specifically so
-- `supabase gen types` marks tracking_code as optional on insert — callers
-- (see actions/filings.ts) never need to pass it themselves.
create function public.generate_tracking_code()
returns text
language sql
volatile
as $$
  select 'TF-' || to_char(now(), 'YYYY') || '-'
    || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
$$;

alter table public.filings alter column tracking_code set default public.generate_tracking_code();

-- ---------------------------------------------------------------------------
-- Status history
-- ---------------------------------------------------------------------------

-- Runs as the table owner (security definer), which is exempt from RLS, so
-- this is the only writer filing_status_history ever needs — no INSERT
-- policy exists for any role on that table.
create function public.log_filing_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.filing_status_history (filing_id, status, changed_by)
    values (new.id, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create trigger filings_log_status_insert after insert on public.filings
  for each row execute function public.log_filing_status_change();
create trigger filings_log_status_update after update on public.filings
  for each row execute function public.log_filing_status_change();

-- ---------------------------------------------------------------------------
-- Client-facing regime selection
-- ---------------------------------------------------------------------------

-- The one field a client can set directly on a filing they don't otherwise
-- have UPDATE rights on (see rls_filings.sql for why this is an RPC rather
-- than a column-level grant).
create function public.set_filing_regime(p_filing_id uuid, p_regime public.regime_type)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.filings
  set regime_selected = p_regime
  where id = p_filing_id and client_id = auth.uid();

  if not found then
    raise exception 'Filing not found or not owned by caller';
  end if;
end;
$$;

grant execute on function public.set_filing_regime(uuid, public.regime_type) to authenticated;

-- ---------------------------------------------------------------------------
-- Sensitive identity: write + audited reveal
-- ---------------------------------------------------------------------------

create function public.set_user_pan(p_user_id uuid, p_pan text)
returns void
language plpgsql
security definer
-- extensions schema needed here: pgp_sym_encrypt/digest come from pgcrypto,
-- which this project installs into "extensions", not "public" (see
-- extensions.sql). gen_random_uuid() doesn't need this since it's built into
-- core Postgres since v13, which is why other functions in this file don't.
set search_path = public, extensions
as $$
declare
  v_key text;
begin
  if not (auth.uid() = p_user_id or public.is_admin()) then
    raise exception 'Not authorized to set this PAN';
  end if;

  select decrypted_secret into v_key
  from vault.decrypted_secrets where name = 'identity_encryption_key';

  insert into public.user_sensitive_identity (user_id, pan_encrypted, pan_hash, encryption_key_version)
  values (
    p_user_id,
    pgp_sym_encrypt(p_pan, v_key),
    encode(digest(p_pan, 'sha256'), 'hex'),
    1
  )
  on conflict (user_id) do update
    set pan_encrypted = excluded.pan_encrypted,
        pan_hash = excluded.pan_hash,
        updated_at = now();

  update public.users
  set pan_masked = substr(p_pan, 1, 5) || '****' || right(p_pan, 1)
  where id = p_user_id;
end;
$$;

grant execute on function public.set_user_pan(uuid, text) to authenticated;

create function public.set_user_aadhaar(p_user_id uuid, p_aadhaar text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_key text;
begin
  if not (auth.uid() = p_user_id or public.is_admin()) then
    raise exception 'Not authorized to set this Aadhaar number';
  end if;

  select decrypted_secret into v_key
  from vault.decrypted_secrets where name = 'identity_encryption_key';

  insert into public.user_sensitive_identity (user_id, aadhaar_encrypted, encryption_key_version)
  values (p_user_id, pgp_sym_encrypt(p_aadhaar, v_key), 1)
  on conflict (user_id) do update
    set aadhaar_encrypted = excluded.aadhaar_encrypted,
        updated_at = now();
end;
$$;

grant execute on function public.set_user_aadhaar(uuid, text) to authenticated;

-- Decryption only ever happens here, and every call is audit-logged. Never
-- SELECT pan_encrypted/aadhaar_encrypted directly.
create function public.get_full_pan(p_user_id uuid)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_key text;
  v_pan text;
begin
  if not (auth.uid() = p_user_id or public.is_admin()) then
    raise exception 'Not authorized to view this PAN';
  end if;

  select decrypted_secret into v_key
  from vault.decrypted_secrets where name = 'identity_encryption_key';

  select pgp_sym_decrypt(pan_encrypted, v_key) into v_pan
  from public.user_sensitive_identity
  where user_id = p_user_id;

  insert into public.audit_log (actor_id, action, target_table, target_id)
  values (auth.uid(), 'reveal_pan', 'user_sensitive_identity', p_user_id);

  return v_pan;
end;
$$;

grant execute on function public.get_full_pan(uuid) to authenticated;

create function public.get_full_aadhaar(p_user_id uuid)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_key text;
  v_aadhaar text;
begin
  if not (auth.uid() = p_user_id or public.is_admin()) then
    raise exception 'Not authorized to view this Aadhaar number';
  end if;

  select decrypted_secret into v_key
  from vault.decrypted_secrets where name = 'identity_encryption_key';

  select pgp_sym_decrypt(aadhaar_encrypted, v_key) into v_aadhaar
  from public.user_sensitive_identity
  where user_id = p_user_id;

  insert into public.audit_log (actor_id, action, target_table, target_id)
  values (auth.uid(), 'reveal_aadhaar', 'user_sensitive_identity', p_user_id);

  return v_aadhaar;
end;
$$;

grant execute on function public.get_full_aadhaar(uuid) to authenticated;

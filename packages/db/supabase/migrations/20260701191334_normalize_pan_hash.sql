-- Fix: set_user_pan() hashed whatever case/whitespace the caller submitted,
-- with no normalization. Since admin search (Phase 9) needs to compute the
-- same hash independently to do an exact-match lookup, the two computations
-- have to agree on a canonical form — PAN numbers are conventionally
-- uppercase alphanumeric, so normalize to upper(trim(...)) before both
-- encrypting and hashing. Re-created with CREATE OR REPLACE rather than
-- editing the original migration, since this is a genuine bug found later,
-- not a mistake in a migration that never ran.
create or replace function public.set_user_pan(p_user_id uuid, p_pan text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_key text;
  v_pan text;
begin
  if not (auth.uid() = p_user_id or public.is_admin()) then
    raise exception 'Not authorized to set this PAN';
  end if;

  v_pan := upper(trim(p_pan));

  select decrypted_secret into v_key
  from vault.decrypted_secrets where name = 'identity_encryption_key';

  insert into public.user_sensitive_identity (user_id, pan_encrypted, pan_hash, encryption_key_version)
  values (
    p_user_id,
    pgp_sym_encrypt(v_pan, v_key),
    encode(digest(v_pan, 'sha256'), 'hex'),
    1
  )
  on conflict (user_id) do update
    set pan_encrypted = excluded.pan_encrypted,
        pan_hash = excluded.pan_hash,
        updated_at = now();

  update public.users
  set pan_masked = substr(v_pan, 1, 5) || '****' || right(v_pan, 1)
  where id = p_user_id;
end;
$$;

-- Public profile table mirroring auth.users. No PAN/Aadhaar plaintext here —
-- see sensitive_identity migration for that separation.

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  role public.user_role not null default 'client',
  phone text,
  -- Display-only masked PAN, e.g. "ABCDE****F". Derived at write time from the
  -- real value held in user_sensitive_identity — never store the full PAN here.
  pan_masked text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.users is 'Public profile data. Sensitive identifiers (PAN/Aadhaar) live in user_sensitive_identity with tighter RLS.';

-- New auth.users rows get a matching public.users row, defaulting to the
-- client role. Preparer/admin accounts are promoted by an admin afterwards
-- (self-service signup is client-only).
create function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.email),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

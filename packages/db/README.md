# @tf-core/db

Supabase schema, migrations, and generated TypeScript types for TaxFlow India.

## Local development

```bash
pnpm --filter @tf-core/db start   # supabase start (requires Docker)
pnpm --filter @tf-core/db reset   # apply all migrations + seed.sql
pnpm --filter @tf-core/db gen:types
pnpm --filter @tf-core/db stop
```

## Seed the identity encryption key (after every `db reset`)

PAN/Aadhaar are encrypted with a symmetric key stored in Supabase Vault
(`vault.decrypted_secrets`), not in a migration file. `supabase db reset`
recreates the database from scratch, which wipes Vault secrets along with
everything else (confirmed empirically — this is not a one-time step),
so re-run this after every reset, not just the first one:

```sql
select vault.create_secret('replace-with-a-real-random-value', 'identity_encryption_key');
```

Run this via `docker exec -i supabase_db_tf-core psql -U postgres -d postgres -c "..."`
or the local Studio SQL editor (http://localhost:54423 — see
`supabase/config.toml` for the actual port, shifted from the CLI default to
avoid colliding with other local Supabase projects on this machine). Without
this secret, `set_user_pan`/`set_user_aadhaar`/`get_full_pan`/`get_full_aadhaar`
will fail with "function ... does not exist" or return null.

For a hosted Supabase project, set the same secret via the Vault section of
the Supabase dashboard before those RPCs are used in that environment.

## Migration ordering

See the design plan for the full rationale. In short: one logical unit per
file, DDL and RLS policies kept in separate files per table so access-rule
changes are independently reviewable from schema changes.

# TaxFlow India

A filing intake and case-management platform for Indian CA (Chartered Accountant) firms — clients submit ITR (Income Tax Return) filings and documents online, preparers review and progress them through computation and e-filing, and admins run the firm's services, deadlines, staff, and reporting.

> **Portfolio project.** All tax rules, deadlines, pricing, and eligibility criteria shown in the app are illustrative demo data, not real guidance — Indian tax law changes annually and none of this should be relied on for an actual filing.

## Features

**Public site**
- Marketing homepage and a directory of services (ITR-1/2/4, GST) with eligibility, required documents, pricing, and FAQ, statically generated per service
- A public filing tracker (`/track/[code]`) — anyone with a tracking code can see status and timeline with no login, via a `SECURITY DEFINER` RPC that only ever exposes a narrow, allow-listed set of columns
- Client-side service search/filter

**Client**
- Register, start a filing against a service, and track it through every status from submission to e-verification
- Document checklist derived dynamically from the service's required documents vs. what's been uploaded, with per-document approve/reject review state
- Old vs. new tax regime selection, computation summary, status timeline, messaging with the assigned preparer, and a download center for finished outputs (computation sheet, filed ITR copy, ITR-V)

**Preparer (CA / staff)**
- Firm-wide read access to filings (small-firm collaboration model — see [Architecture](#architecture)), assignment-scoped write access
- Review uploaded documents (approve/reject with a note — rejecting is the "please re-upload" signal back to the client), advance filing status, record computation results
- Internal-only notes on the message thread, invisible to the client

**Admin**
- Firm-wide filings dashboard with multi-field filters (status, service, preparer, assessment year, free-text, exact-match PAN search)
- Service and deadline CRUD, staff provisioning (creates the Supabase Auth user directly — there's no public preparer/admin signup), reassignment between preparers
- Deadline-risk analytics (open filings approaching a due date)
- Audited PAN/Aadhaar reveal — full values are encrypted at rest and only ever decrypted through a `SECURITY DEFINER` RPC that checks caller identity and writes an audit log row on every call

**Notifications**
- Event-triggered emails (filing created, status change, computation ready, document rejected) plus a daily Vercel Cron job for deadline reminders (30/15/7/1-day thresholds) and e-verification staleness, idempotent against a `notifications_log` dedupe key so re-runs never double-send

## Tech stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Actions, Turbopack) |
| Language | TypeScript, [Zod](https://zod.dev) for input validation |
| UI | React 19, Tailwind CSS v4, [Phosphor Icons](https://phosphoricons.com) |
| Backend | [Supabase](https://supabase.com) — Postgres, Auth, Storage, Row Level Security |
| Monorepo | pnpm workspaces + [Turborepo](https://turbo.build) |
| Testing | [Vitest](https://vitest.dev) (unit), [Playwright](https://playwright.dev) (e2e, configured) |
| Scheduled jobs | Vercel Cron → Next.js route handlers |
| CI/CD | GitHub Actions (see [CI/CD](#cicd)) |

## Architecture

```
tf-core/
├── apps/
│   └── web/                  # The entire product — Next.js App Router app
│       ├── app/
│       │   ├── (public)/     # Homepage, services, tracker — no auth
│       │   ├── (auth)/       # Login, register
│       │   ├── dashboard/    # Client role
│       │   ├── preparer/     # Preparer role
│       │   ├── admin/        # Admin role
│       │   └── api/cron/     # Vercel Cron targets
│       ├── actions/          # Server Actions, grouped by domain
│       ├── components/       # ui/ primitives + feature components
│       ├── lib/               # supabase/, auth/, filings/, notifications/, storage/
│       ├── proxy.ts          # Next 16's middleware.ts rename — session refresh + coarse auth gate
│       └── tests/            # Vitest unit tests
├── packages/
│   ├── db/                   # Supabase schema, migrations, generated types
│   │   └── supabase/{config.toml, migrations/, seed.sql}
│   └── config/                # Shared tsconfig base + eslint preset
├── scripts/
│   └── lint-rls-policies.mjs # Static RLS-policy security lint (see Security)
└── .github/workflows/        # CI/CD pipeline
```

**Auth & authorization layers** — three layers, deliberately not one:
1. `proxy.ts` — refreshes the session cookie and does a coarse "no session → `/login`" redirect on protected path prefixes. No DB role lookup here (that would cost a round trip on every request).
2. Each protected route group's `layout.tsx` (`dashboard/`, `preparer/`, `admin/`) — resolves `public.users.role` once per request tree via [`lib/auth/dal.ts`](apps/web/lib/auth/dal.ts) and redirects on a role mismatch. This is a UX convenience, not the real security boundary.
3. **Row Level Security is the actual security boundary.** Every Server Action re-checks role/ownership at the top rather than trusting the route guard, and every table with user data has RLS enabled with per-operation (not blanket `ALL`) policies. Preparers get firm-wide `SELECT` but assignment-scoped `UPDATE` — a deliberate v1 trade-off for small-firm collaboration, documented in [`rls_filings.sql`](packages/db/supabase/migrations/20260701125104_rls_filings.sql).

**Sensitive identity data** (PAN/Aadhaar) live in a separate `user_sensitive_identity` table, encrypted with `pgcrypto` using a key from Supabase Vault, with a deterministic hash column for exact-match search without decryption. Decryption only happens through an audited `SECURITY DEFINER` RPC — see [functions_triggers.sql](packages/db/supabase/migrations/20260701125220_functions_triggers.sql).

## Getting started

**Prerequisites:** Node ≥20, [pnpm](https://pnpm.io) 10.x, [Docker](https://www.docker.com/) (for local Supabase), the [Supabase CLI](https://supabase.com/docs/guides/cli) (installed automatically as a dev dependency of `packages/db`).

```bash
# 1. Install dependencies
pnpm install

# 2. Start the local Supabase stack (Postgres, Auth, Storage, Studio)
pnpm db:start

# 3. Apply all migrations and seed demo data
pnpm db:reset

# 4. Seed the PAN/Aadhaar encryption key (Vault secrets don't survive db:reset — redo this after every reset)
docker exec -i supabase_db_tf-core psql -U postgres -d postgres \
  -c "select vault.create_secret('replace-with-a-real-random-value', 'identity_encryption_key');"

# 5. Set up environment variables
cp apps/web/.env.example apps/web/.env.local
# fill in the values `pnpm db:start` printed (URL, publishable key, secret key)

# 6. Run the dev server
pnpm dev
```

The app runs at `http://localhost:3000`, Supabase Studio at whichever port `packages/db/supabase/config.toml` assigns (printed by `pnpm db:start`; shifted from the CLI defaults to avoid colliding with other local Supabase projects on the same machine).

See [`packages/db/README.md`](packages/db/README.md) for more on local Supabase setup and type generation.

### Demo accounts

Seeded by `packages/db/supabase/seed.sql`, password `password123` for all three:

| Role | Email |
|---|---|
| Client | `client@taxflow.test` |
| Preparer (CA) | `preparer@taxflow.test` |
| Admin | `admin@taxflow.test` |

## Testing

```bash
pnpm test        # Vitest — pure logic: checklist derivation, deadline math, etc.
pnpm test:e2e     # Playwright — configured, not yet populated with specs
pnpm typecheck    # tsc --noEmit across the workspace
pnpm lint         # eslint across the workspace
```

Vitest covers logic that's cheap to unit test and easy to get subtly wrong (date-math for deadline countdowns, checklist status derivation) — RLS behavior and full page rendering are intentionally not Vitest's job; those were verified manually against a live local Supabase stack during development.

## Security

- **RLS lint** — [`scripts/lint-rls-policies.mjs`](scripts/lint-rls-policies.mjs) statically replays every migration and flags any `INSERT`/`UPDATE`/`DELETE`/`ALL` policy that resolves to `USING (true)` with no role or ownership restriction (the classic "service-role bypasses RLS and needs no policy, but an unscoped policy grants `anon` write access" mistake). Wired into `pr-checks.yml` on every PR.
- **Sensitive data** — see [Architecture](#architecture) above. PAN/Aadhaar are never stored in plaintext and never returned by a plain `SELECT`; every reveal is audited.
- **Document uploads** — restricted to PDF/JPEG/PNG both in the upload Server Action and at the Storage bucket level, and finished-output downloads are served with `Content-Disposition: attachment` rather than rendered inline.
- A full point-in-time audit report format is documented for reuse but not committed (regenerate locally; it's gitignored as `security-audit-*.md`).

## CI/CD

Four GitHub Actions workflows in `.github/workflows/`:

| Workflow | Trigger | Does |
|---|---|---|
| `pr-checks.yml` | PR → `main` | Typecheck, lint, RLS lint, unit tests, Vercel preview deploy + PR comment |
| `dev-deploy.yml` | push to `dev` | Supabase migrations → Vercel preview deploy |
| `staging-deploy.yml` | push to `main` | Supabase migrations → Vercel production deploy |
| `prod-deploy.yml` | tag `v*.*.*` | Manual approval gate → Supabase migrations → Vercel production deploy → GitHub Release |

Requires `VERCEL_TOKEN`, `SUPABASE_ACCESS_TOKEN`, and a `{DEV,STAGING,PROD}_SUPABASE_PROJECT_REF` secret per environment. See the workflow files for the full list and setup notes (Vercel project linking, the `production` GitHub Environment approval gate, etc.).

## Scripts reference

Run from the repo root (fanned out via Turborepo to the relevant package):

| Script | Does |
|---|---|
| `pnpm dev` | Start the Next.js dev server |
| `pnpm build` | Production build |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` | Lint / typecheck / unit test the workspace |
| `pnpm test:e2e` | Run Playwright specs |
| `pnpm db:start` / `pnpm db:stop` | Start/stop the local Supabase stack |
| `pnpm db:reset` | Recreate the local DB from migrations + seed data |
| `pnpm db:gen-types` | Regenerate `packages/db/src/types.ts` from the local schema |

## Deployment

Frontend deploys to [Vercel](https://vercel.com); database migrations deploy to hosted Supabase Cloud projects (one each for dev/staging/prod). Both are automated by the CI/CD pipeline above — see that section for the exact flow and required secrets.

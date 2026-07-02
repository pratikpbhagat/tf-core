#!/usr/bin/env node
// Static lint over packages/db/supabase/migrations/*.sql — flags any policy that
// ends up FOR INSERT/UPDATE/DELETE/ALL and resolves to `true` with no role/
// ownership restriction after replaying all migrations in order.
//
// The classic mistake: a policy named "*_service_write" with USING (true) and
// no TO clause. The service-role client bypasses RLS entirely and needs no
// policy — such policies grant public (anon) write access.
//
// Run: node scripts/lint-rls-policies.mjs
// Exits non-zero if violations remain in the final migration state.

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const MIGRATIONS_DIR = join(import.meta.dirname, '..', 'packages', 'db', 'supabase', 'migrations');

const CREATE_RE = /CREATE POLICY\s+"([^"]+)"\s+ON\s+([\w.]+)\s+FOR\s+(INSERT|UPDATE|DELETE|ALL)\s*([\s\S]*?);/gi;
const DROP_RE   = /DROP POLICY\s+(?:IF EXISTS\s+)?"([^"]+)"\s+ON\s+([\w.]+)\s*;/gi;

const SAFE_ROLE_RE      = /\bTO\s+(service_role|authenticated)\b/i;
const SAFE_CONDITION_RE = /auth\.uid\(\)|auth\.role\(\)\s*=\s*'service_role'|is_club_manager\(|is_admin\(|is_preparer\(|EXISTS\s*\(/i;

function isViolation(body) {
  if (SAFE_ROLE_RE.test(body) && SAFE_CONDITION_RE.test(body)) return false;
  if (SAFE_CONDITION_RE.test(body)) return false;
  const hasTrueCondition = /\b(USING|WITH CHECK)\s*\(\s*true\s*\)/i.test(body);
  const hasNoCondition   = !/USING|WITH CHECK/i.test(body);
  return hasTrueCondition || hasNoCondition;
}

const files = readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();
const liveByKey = new Map();

for (const file of files) {
  const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
  const events = [];
  let m;
  CREATE_RE.lastIndex = 0;
  while ((m = CREATE_RE.exec(sql)) !== null)
    events.push({ index: m.index, type: 'create', name: m[1], table: m[2], cmd: m[3], body: m[4], file });
  DROP_RE.lastIndex = 0;
  while ((m = DROP_RE.exec(sql)) !== null)
    events.push({ index: m.index, type: 'drop', name: m[1], table: m[2] });
  events.sort((a, b) => a.index - b.index);
  for (const e of events) {
    const key = `${e.table}::${e.name}`;
    if (e.type === 'drop') liveByKey.delete(key);
    else liveByKey.set(key, e);
  }
}

const violations = [...liveByKey.values()].filter(p => isViolation(p.body));

if (violations.length > 0) {
  console.error('✗ Found RLS policies that grant public write access with no ownership check:\n');
  for (const v of violations)
    console.error(`  ${v.file}: "${v.name}" ON ${v.table} FOR ${v.cmd}`);
  console.error(
    '\nA policy with no role restriction applies to every Postgres role, including\n' +
    'unauthenticated `anon`. If this is meant to be backend-only, the service-role\n' +
    'client bypasses RLS entirely and needs no policy — just remove it.\n' +
    'If real users should write here, scope with: auth.uid() = owner_column, etc.'
  );
  process.exit(1);
}

console.log(`✓ No public-write RLS violations found (${files.length} migration files, ${liveByKey.size} live policies).`);

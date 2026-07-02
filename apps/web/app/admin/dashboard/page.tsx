import { createHash } from "node:crypto";

import type { FilingStatus } from "@tf-core/db";
import Link from "next/link";

import { FILING_STATUS_LABELS, FILING_STATUS_VALUES } from "@/lib/filings/status";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<{ status?: string; service?: string; preparer?: string; ay?: string; q?: string; pan?: string }>;
};

const selectClass = "rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900";

function isFilingStatus(value: string): value is FilingStatus {
  return (FILING_STATUS_VALUES as readonly string[]).includes(value);
}

export default async function AdminDashboardPage({ searchParams }: Props) {
  const { status, service: serviceId, preparer: preparerId, ay, q, pan } = await searchParams;
  const supabase = await createClient();

  let panNoMatch = false;
  let panClientId: string | null = null;
  if (pan) {
    // Exact-match only, via the same sha256 hash set_user_pan() computes at
    // write time — never a plaintext/ILIKE search against decrypted PAN.
    const panHash = createHash("sha256").update(pan.trim().toUpperCase()).digest("hex");
    const { data: identity } = await supabase
      .from("user_sensitive_identity")
      .select("user_id")
      .eq("pan_hash", panHash)
      .maybeSingle();
    if (identity) panClientId = identity.user_id;
    else panNoMatch = true;
  }

  let query = supabase
    .from("filings")
    .select("id, tracking_code, status, assessment_year, client_id, service_id, assigned_preparer_id")
    .order("created_at", { ascending: false });

  if (status && isFilingStatus(status)) query = query.eq("status", status);
  if (serviceId) query = query.eq("service_id", serviceId);
  if (preparerId) query = query.eq("assigned_preparer_id", preparerId);
  if (ay) query = query.eq("assessment_year", ay);
  if (panClientId) query = query.eq("client_id", panClientId);

  const { data: rawFilings } = panNoMatch ? { data: [] } : await query;

  const { data: services } = await supabase.from("services").select("id, name").order("name");
  const { data: preparers } = await supabase.from("users").select("id, name").eq("role", "preparer").order("name");
  const { data: deadlineYears } = await supabase.from("filing_deadlines").select("assessment_year");
  const assessmentYears = [...new Set((deadlineYears ?? []).map((d) => d.assessment_year))].sort().reverse();

  const clientIds = [...new Set((rawFilings ?? []).map((filing) => filing.client_id))];
  const { data: clients } =
    clientIds.length > 0 ? await supabase.from("users").select("id, name").in("id", clientIds) : { data: [] };

  const serviceNameById = new Map((services ?? []).map((service) => [service.id, service.name]));
  const preparerNameById = new Map((preparers ?? []).map((preparer) => [preparer.id, preparer.name]));
  const clientNameById = new Map((clients ?? []).map((client) => [client.id, client.name]));

  // Free-text search over tracking code + client name happens here, not in
  // SQL — joining across filings/users for an ILIKE match isn't worth a
  // dedicated query at this dataset size, and we already have both fetched.
  const trimmedQuery = q?.trim().toLowerCase();
  const filings = trimmedQuery
    ? (rawFilings ?? []).filter((filing) => {
        const clientName = clientNameById.get(filing.client_id)?.toLowerCase() ?? "";
        return filing.tracking_code.toLowerCase().includes(trimmedQuery) || clientName.includes(trimmedQuery);
      })
    : (rawFilings ?? []);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-12">
      <h1 className="text-2xl font-semibold">Firm-wide filings</h1>

      <form className="flex flex-wrap items-center gap-3" method="get">
        <input
          type="text"
          name="q"
          aria-label="Search by client name or tracking code"
          defaultValue={q ?? ""}
          placeholder="Client name or tracking code"
          className={`${selectClass} w-56`}
        />
        <input
          type="text"
          name="pan"
          aria-label="Search by exact PAN"
          defaultValue={pan ?? ""}
          placeholder="PAN (exact)"
          className={`${selectClass} w-32`}
        />
        <select name="status" aria-label="Filter by status" defaultValue={status ?? ""} className={selectClass}>
          <option value="">All statuses</option>
          {FILING_STATUS_VALUES.map((value) => (
            <option key={value} value={value}>
              {FILING_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
        <select name="service" aria-label="Filter by service" defaultValue={serviceId ?? ""} className={selectClass}>
          <option value="">All services</option>
          {(services ?? []).map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
        <select name="preparer" aria-label="Filter by preparer" defaultValue={preparerId ?? ""} className={selectClass}>
          <option value="">All preparers</option>
          {(preparers ?? []).map((preparer) => (
            <option key={preparer.id} value={preparer.id}>
              {preparer.name}
            </option>
          ))}
        </select>
        <select name="ay" aria-label="Filter by assessment year" defaultValue={ay ?? ""} className={selectClass}>
          <option value="">All years</option>
          {assessmentYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background">
          Filter
        </button>
        <Link href="/admin/dashboard" className="text-xs font-medium underline">
          Clear
        </Link>
      </form>

      {panNoMatch && <p className="text-sm text-amber-600">No client found with that PAN.</p>}

      <div className="flex flex-col gap-2">
        {filings.length === 0 && !panNoMatch && <p className="text-sm text-zinc-500">No filings match these filters.</p>}
        {filings.map((filing) => (
          <Link
            key={filing.id}
            href={`/admin/filings/${filing.id}`}
            className="flex items-center justify-between rounded-md border border-zinc-200 p-3 hover:border-zinc-400 dark:border-zinc-800"
          >
            <div>
              <p className="text-sm font-medium">{serviceNameById.get(filing.service_id) ?? "Filing"}</p>
              <p className="text-xs text-zinc-500">
                {filing.tracking_code} — {clientNameById.get(filing.client_id) ?? "Unknown client"} — AY{" "}
                {filing.assessment_year}
              </p>
            </div>
            <div className="text-right text-xs text-zinc-500">
              <p>{FILING_STATUS_LABELS[filing.status] ?? filing.status}</p>
              <p>{filing.assigned_preparer_id ? (preparerNameById.get(filing.assigned_preparer_id) ?? "—") : "Unassigned"}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

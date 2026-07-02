import { notFound, redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

import { CreateFilingForm } from "./create-filing-form";

type Props = { searchParams: Promise<{ service?: string }> };

export default async function NewFilingPage({ searchParams }: Props) {
  const { service: slug } = await searchParams;
  if (!slug) redirect("/services");

  const user = await getSessionUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const { data: service } = await supabase
    .from("services")
    .select("id, name, applicable_deadline_type")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!service) notFound();

  const { data: deadline } = await supabase
    .from("filing_deadlines")
    .select("assessment_year")
    .eq("filer_category", service.applicable_deadline_type)
    .order("assessment_year", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Seed data always has at least one deadline row per filer_category, but
  // fall back defensively rather than crash if a future service references a
  // category with no deadline configured yet.
  const assessmentYear = deadline?.assessment_year ?? "2025-26";

  // Avoid creating a duplicate filing if the client already started one for
  // this service + AY (e.g. double submit, or navigating back here).
  const { data: existing } = await supabase
    .from("filings")
    .select("id")
    .eq("client_id", user.id)
    .eq("service_id", service.id)
    .eq("assessment_year", assessmentYear)
    .maybeSingle();

  if (existing) redirect(`/dashboard/filings/${existing.id}`);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-16">
      <div>
        <h1 className="text-2xl font-semibold">Start your {service.name} filing</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Assessment Year {assessmentYear}</p>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        We&apos;ll create the filing and take you straight to your document checklist.
      </p>
      <CreateFilingForm serviceId={service.id} assessmentYear={assessmentYear} />
    </div>
  );
}

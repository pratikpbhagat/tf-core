import Link from "next/link";
import { notFound } from "next/navigation";

import { IllustrativeDisclaimer } from "@/components/disclaimer";
import { createPublicClient } from "@/lib/supabase/public";

export const revalidate = 3600;

type RequiredDocument = { document_type: string; label: string; required: boolean };
type FaqEntry = { question: string; answer: string };

export async function generateStaticParams() {
  const supabase = createPublicClient();
  const { data } = await supabase.from("services").select("slug").eq("is_active", true);
  return (data ?? []).map((service) => ({ slug: service.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = createPublicClient();
  const { data: service } = await supabase
    .from("services")
    .select("name, description")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!service) return {};
  return { title: `${service.name} — TaxFlow India`, description: service.description };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createPublicClient();

  const { data: service } = await supabase.from("services").select("*").eq("slug", slug).eq("is_active", true).maybeSingle();

  if (!service) notFound();

  const { data: deadline } = await supabase
    .from("filing_deadlines")
    .select("assessment_year, due_date, is_extended")
    .eq("filer_category", service.applicable_deadline_type)
    .order("assessment_year", { ascending: false })
    .limit(1)
    .maybeSingle();

  const requiredDocuments = (service.required_documents as unknown as RequiredDocument[]) ?? [];
  const faq = (service.faq as unknown as FaqEntry[]) ?? [];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-16">
      <div>
        <p className="text-sm font-medium tracking-wide text-zinc-500 uppercase">{service.category}</p>
        <h1 className="text-3xl font-semibold">{service.name}</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">{service.description}</p>
      </div>

      <section>
        <h2 className="mb-2 text-lg font-medium">Eligibility</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{service.eligibility_criteria}</p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium">Documents you&apos;ll need</h2>
        <ul className="flex flex-col gap-2">
          {requiredDocuments.map((doc) => (
            <li
              key={doc.document_type}
              className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
            >
              <span>{doc.label}</span>
              {!doc.required && <span className="text-xs text-zinc-500">optional</span>}
            </li>
          ))}
        </ul>
      </section>

      {deadline && (
        <section>
          <h2 className="mb-2 text-lg font-medium">Deadline</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            AY {deadline.assessment_year}: due{" "}
            {new Date(deadline.due_date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {deadline.is_extended && " (extended)"}
          </p>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-lg font-medium">Pricing</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{service.price_display}</p>
      </section>

      {faq.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-medium">FAQ</h2>
          <div className="flex flex-col gap-4">
            {faq.map((entry) => (
              <div key={entry.question}>
                <p className="font-medium">{entry.question}</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{entry.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <IllustrativeDisclaimer />

      <div>
        <Link
          href={`/dashboard/filings/new?service=${service.slug}`}
          className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background"
        >
          Start this filing
        </Link>
      </div>
    </div>
  );
}

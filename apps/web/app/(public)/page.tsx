import Link from "next/link";

import { IllustrativeDisclaimer } from "@/components/disclaimer";
import { createPublicClient } from "@/lib/supabase/public";

export const revalidate = 3600;

const TRUST_SIGNALS = [
  "Documents stored securely, not scattered across chats",
  "One preparer, one thread — no more forwarding screenshots",
  "Track status and refunds without asking \"any update?\"",
];

export default async function HomePage() {
  const supabase = createPublicClient();
  const { data: services } = await supabase
    .from("services")
    .select("slug, name, description")
    .eq("is_active", true)
    .order("category")
    .limit(4);

  return (
    <div className="flex flex-1 flex-col">
      <section className="flex flex-col items-center gap-6 px-4 py-24 text-center">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight">
          ITR filing, handled with your CA — not over WhatsApp.
        </h1>
        <p className="max-w-xl text-zinc-600 dark:text-zinc-400">
          Upload documents, track your filing status, and message your preparer in one place — from submission to
          refund.
        </p>
        <div className="flex gap-4">
          <Link href="/register" className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background">
            Start a filing
          </Link>
          <Link
            href="/services"
            className="rounded-md border border-zinc-300 px-5 py-2.5 text-sm font-medium dark:border-zinc-700"
          >
            Browse services
          </Link>
        </div>
        <ul className="mt-4 flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          {TRUST_SIGNALS.map((signal) => (
            <li key={signal}>{signal}</li>
          ))}
        </ul>
      </section>

      <section className="border-t border-zinc-200 px-4 py-16 dark:border-zinc-800">
        <h2 className="mb-8 text-center text-2xl font-semibold">Services we offer</h2>
        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
          {services?.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="rounded-lg border border-zinc-200 p-5 hover:border-zinc-400 dark:border-zinc-800"
            >
              <h3 className="font-medium">{service.name}</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{service.description}</p>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/services" className="text-sm font-medium underline">
            View all services
          </Link>
        </div>
      </section>

      <section className="border-t border-zinc-200 px-4 py-12 dark:border-zinc-800">
        <div className="mx-auto max-w-2xl">
          <IllustrativeDisclaimer />
        </div>
      </section>
    </div>
  );
}

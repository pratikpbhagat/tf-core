import { ArrowRight, ChatCircleDots, LockKey, UsersThree } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { IllustrativeDisclaimer } from "@/components/disclaimer";
import { buttonVariants } from "@/components/ui/button";
import { cardVariants } from "@/components/ui/card";
import { createPublicClient } from "@/lib/supabase/public";

export const revalidate = 3600;

const TRUST_SIGNALS = [
  { icon: LockKey, text: "Documents stored securely, not scattered across chats" },
  { icon: ChatCircleDots, text: "One preparer, one thread — no more forwarding screenshots" },
  { icon: UsersThree, text: "Track status and refunds without asking \"any update?\"" },
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
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-10%,color-mix(in_srgb,var(--color-primary)_18%,transparent),transparent_60%)]"
          aria-hidden="true"
        />
        <div className="flex flex-col items-center gap-6 px-4 py-24 text-center">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            ITR filing, handled with your CA — not over WhatsApp.
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Upload documents, track your filing status, and message your preparer in one place — from submission to
            refund.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className={buttonVariants({ size: "md" })}>
              Start a filing
              <ArrowRight weight="bold" className="h-4 w-4" />
            </Link>
            <Link href="/services" className={buttonVariants({ variant: "outline", size: "md" })}>
              Browse services
            </Link>
          </div>
          <ul className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6">
            {TRUST_SIGNALS.map((signal) => (
              <li key={signal.text} className="flex items-center gap-2">
                <signal.icon weight="bold" className="h-4 w-4 flex-none text-accent" />
                {signal.text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-border px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-semibold">Services we offer</h2>
        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
          {services?.map((service) => (
            <Link key={service.slug} href={`/services/${service.slug}`} className={cardVariants({ interactive: true, className: "p-5" })}>
              <h3 className="font-medium">{service.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/services" className="text-sm font-medium text-primary hover:underline">
            View all services
          </Link>
        </div>
      </section>

      <section className="border-t border-border px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <IllustrativeDisclaimer />
        </div>
      </section>
    </div>
  );
}

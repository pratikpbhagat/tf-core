"use client";

import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useMemo, useState } from "react";

import { cardVariants } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Service = { slug: string; name: string; category: string; description: string; price_display: string };

const CATEGORY_LABELS: Record<string, string> = {
  itr: "Income Tax Returns",
  gst: "GST",
};

// Filters purely client-side over the already-fetched (server-rendered,
// ISR'd) list — no extra network request per keystroke, and the page itself
// stays statically generatable since only this leaf component is a client
// component.
export function ServiceSearch({ services }: { services: Service[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return services;
    return services.filter(
      (service) =>
        service.name.toLowerCase().includes(q) ||
        service.description.toLowerCase().includes(q) ||
        service.category.toLowerCase().includes(q),
    );
  }, [services, query]);

  const grouped = useMemo(
    () =>
      filtered.reduce<Record<string, Service[]>>((acc, service) => {
        (acc[service.category] ??= []).push(service);
        return acc;
      }, {}),
    [filtered],
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="relative max-w-sm">
        <label htmlFor="service-search" className="sr-only">
          Search services
        </label>
        <MagnifyingGlass weight="bold" className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="service-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search services (e.g. capital gains, GST)..."
          className="pl-9"
        />
      </div>

      {Object.keys(grouped).length === 0 && (
        <p className="text-sm text-muted-foreground">No services match &quot;{query}&quot;.</p>
      )}

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h2 className="mb-4 text-lg font-medium">{CATEGORY_LABELS[category] ?? category}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((service) => (
              <Link key={service.slug} href={`/services/${service.slug}`} className={cardVariants({ interactive: true, className: "flex flex-col gap-1 p-5" })}>
                <h3 className="font-medium">{service.name}</h3>
                <p className="text-sm text-muted-foreground">{service.description}</p>
                <p className="mt-2 text-sm font-medium text-primary">{service.price_display}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

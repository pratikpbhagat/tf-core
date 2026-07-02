"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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
      <div>
        <label htmlFor="service-search" className="sr-only">
          Search services
        </label>
        <input
          id="service-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search services (e.g. capital gains, GST)..."
          className="w-full max-w-sm rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      {Object.keys(grouped).length === 0 && (
        <p className="text-sm text-zinc-500">No services match &quot;{query}&quot;.</p>
      )}

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h2 className="mb-4 text-lg font-medium">{CATEGORY_LABELS[category] ?? category}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="flex flex-col gap-1 rounded-lg border border-zinc-200 p-5 hover:border-zinc-400 dark:border-zinc-800"
              >
                <h3 className="font-medium">{service.name}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{service.description}</p>
                <p className="mt-2 text-sm font-medium">{service.price_display}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

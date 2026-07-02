import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export default async function AdminServicesPage() {
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("id, name, slug, category, is_active")
    .order("category")
    .order("name");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Services</h1>
        <Link href="/admin/services/new" className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background">
          New service
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {(services ?? []).length === 0 && (
          <p className="text-sm text-zinc-500">No services yet — create one to show up on the public site.</p>
        )}
        {(services ?? []).map((service) => (
          <Link
            key={service.id}
            href={`/admin/services/${service.id}/edit`}
            className="flex items-center justify-between rounded-md border border-zinc-200 p-3 hover:border-zinc-400 dark:border-zinc-800"
          >
            <div>
              <p className="text-sm font-medium">{service.name}</p>
              <p className="text-xs text-zinc-500">
                {service.category} — /{service.slug}
              </p>
            </div>
            <span className={`text-xs font-medium ${service.is_active ? "text-green-700 dark:text-green-400" : "text-zinc-400"}`}>
              {service.is_active ? "Active" : "Inactive"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

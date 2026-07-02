import { Plus } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cardVariants } from "@/components/ui/card";
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
        <Link href="/admin/services/new" className={buttonVariants({ size: "sm" })}>
          <Plus weight="bold" className="h-4 w-4" />
          New service
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {(services ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">No services yet — create one to show up on the public site.</p>
        )}
        {(services ?? []).map((service) => (
          <Link
            key={service.id}
            href={`/admin/services/${service.id}/edit`}
            className={cardVariants({ interactive: true, className: "flex items-center justify-between p-3" })}
          >
            <div>
              <p className="text-sm font-medium">{service.name}</p>
              <p className="text-xs text-muted-foreground">
                {service.category} — /{service.slug}
              </p>
            </div>
            <Badge tone={service.is_active ? "success" : "neutral"}>{service.is_active ? "Active" : "Inactive"}</Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { IllustrativeDisclaimer } from "@/components/disclaimer";
import { ServiceSearch } from "@/components/services/service-search";
import { createPublicClient } from "@/lib/supabase/public";

export const revalidate = 3600;

export default async function ServicesPage() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("services")
    .select("slug, name, category, description, price_display")
    .eq("is_active", true)
    .order("category")
    .order("name");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-4 py-16">
      <div>
        <h1 className="text-3xl font-semibold">Services</h1>
        <p className="mt-2 text-muted-foreground">Pick the filing that matches your situation.</p>
      </div>

      <ServiceSearch services={data ?? []} />

      <IllustrativeDisclaimer />
    </div>
  );
}

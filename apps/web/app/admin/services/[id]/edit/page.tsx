import { notFound } from "next/navigation";

import { ServiceForm, type ServiceFormValues } from "@/components/admin/service-form";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

export default async function EditServicePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: service } = await supabase.from("services").select("*").eq("id", id).maybeSingle();
  if (!service) notFound();

  const defaultValues: ServiceFormValues = {
    id: service.id,
    name: service.name,
    slug: service.slug,
    category: service.category,
    description: service.description,
    eligibilityCriteria: service.eligibility_criteria,
    requiredDocumentsJson: JSON.stringify(service.required_documents, null, 2),
    faqJson: JSON.stringify(service.faq, null, 2),
    applicableDeadlineType: service.applicable_deadline_type,
    priceDisplay: service.price_display,
    isActive: service.is_active,
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-12">
      <h1 className="text-2xl font-semibold">Edit {service.name}</h1>
      <ServiceForm defaultValues={defaultValues} />
    </div>
  );
}

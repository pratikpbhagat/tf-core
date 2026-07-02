import { ServiceForm, type ServiceFormValues } from "@/components/admin/service-form";

const EMPTY_VALUES: ServiceFormValues = {
  name: "",
  slug: "",
  category: "itr",
  description: "",
  eligibilityCriteria: "",
  requiredDocumentsJson: JSON.stringify([{ document_type: "pan_card", label: "PAN Card", required: true }], null, 2),
  faqJson: JSON.stringify([{ question: "", answer: "" }], null, 2),
  applicableDeadlineType: "individual",
  priceDisplay: "",
  isActive: true,
};

export default function NewServicePage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-12">
      <h1 className="text-2xl font-semibold">New service</h1>
      <ServiceForm defaultValues={EMPTY_VALUES} />
    </div>
  );
}

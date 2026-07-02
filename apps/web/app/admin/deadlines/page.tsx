import { DeadlineForm } from "@/components/admin/deadline-form";
import { createClient } from "@/lib/supabase/server";

const EMPTY_VALUES = {
  assessmentYear: "",
  filerCategory: "individual" as const,
  dueDate: "",
  isExtended: false,
  sourceNotificationRef: "",
};

export default async function AdminDeadlinesPage() {
  const supabase = await createClient();
  const { data: deadlines } = await supabase
    .from("filing_deadlines")
    .select("id, assessment_year, filer_category, due_date, is_extended, source_notification_ref")
    .order("assessment_year", { ascending: false })
    .order("filer_category");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-12">
      <h1 className="text-2xl font-semibold">Filing deadlines</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Deadlines are data, not code — updating them here takes effect on the public service pages and the
        deadline-risk view immediately, no deploy required.
      </p>

      <div className="flex flex-col gap-3">
        {(deadlines ?? []).map((deadline) => (
          <DeadlineForm
            key={deadline.id}
            defaultValues={{
              id: deadline.id,
              assessmentYear: deadline.assessment_year,
              filerCategory: deadline.filer_category,
              dueDate: deadline.due_date,
              isExtended: deadline.is_extended,
              sourceNotificationRef: deadline.source_notification_ref ?? "",
            }}
          />
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">Add a new deadline</h2>
        <DeadlineForm defaultValues={EMPTY_VALUES} />
      </div>
    </div>
  );
}

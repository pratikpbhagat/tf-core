import { InviteStaffForm } from "@/components/admin/invite-staff-form";
import { TERMINAL_FILING_STATUSES } from "@/lib/filings/status";
import { createClient } from "@/lib/supabase/server";

export default async function AdminStaffPage() {
  const supabase = await createClient();

  const { data: staff } = await supabase
    .from("users")
    .select("id, name, email, role")
    .in("role", ["preparer", "admin"])
    .order("role")
    .order("name");

  const { data: filings } = await supabase.from("filings").select("assigned_preparer_id, status");

  const workloadByPreparer = new Map<string, number>();
  for (const filing of filings ?? []) {
    if (!filing.assigned_preparer_id) continue;
    if (TERMINAL_FILING_STATUSES.includes(filing.status)) continue;
    workloadByPreparer.set(filing.assigned_preparer_id, (workloadByPreparer.get(filing.assigned_preparer_id) ?? 0) + 1);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12">
      <h1 className="text-2xl font-semibold">Staff</h1>

      <section className="flex flex-col gap-2">
        {(staff ?? []).map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-md border border-zinc-200 p-3 dark:border-zinc-800"
          >
            <div>
              <p className="text-sm font-medium">{member.name}</p>
              <p className="text-xs text-zinc-500">
                {member.email} — {member.role}
              </p>
            </div>
            {member.role === "preparer" && (
              <p className="text-sm font-medium">{workloadByPreparer.get(member.id) ?? 0} active filings</p>
            )}
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Invite staff</h2>
        <InviteStaffForm />
      </section>
    </div>
  );
}

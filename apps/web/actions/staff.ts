"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import { getSessionUser } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const InviteStaffSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  email: z.string().trim().email("Enter a valid email address."),
  role: z.enum(["preparer", "admin"]),
  password: z.string().min(8, "Password must be at least 8 characters long."),
});

export type InviteStaffState = { message?: string } | undefined;

// Self-service signup is client-only (see actions/auth.ts) — this is the
// only way a preparer/admin account gets created. The admin sets an initial
// password directly and relays it to the new hire out of band; there's no
// email delivery step in local dev.
export async function inviteStaff(_state: InviteStaffState, formData: FormData): Promise<InviteStaffState> {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return { message: "Not authorized." };

  const validated = InviteStaffSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password"),
  });
  if (!validated.success) {
    return { message: validated.error.issues[0]?.message ?? "Invalid staff details." };
  }

  // The one operation that genuinely needs the service-role client: creating
  // an auth user via the Admin API bypasses the normal signup flow entirely.
  const serviceClient = createServiceClient();
  const { data: created, error: createError } = await serviceClient.auth.admin.createUser({
    email: validated.data.email,
    password: validated.data.password,
    email_confirm: true,
    user_metadata: { name: validated.data.name },
  });

  if (createError || !created.user) {
    return { message: createError?.message ?? "Could not create the staff account." };
  }

  // handle_new_auth_user already created public.users with role='client';
  // promote it here using the caller's own authenticated session so this
  // step still goes through RLS (users_admin_update), not just the service
  // client bypassing it.
  const supabase = await createClient();
  const { error: updateError } = await supabase
    .from("users")
    .update({ role: validated.data.role, name: validated.data.name })
    .eq("id", created.user.id);

  if (updateError) {
    return { message: "Account created, but role assignment failed — check /admin/staff and try again." };
  }

  revalidatePath("/admin/staff");
  return undefined;
}

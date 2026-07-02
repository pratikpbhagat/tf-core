"use server";

import { redirect } from "next/navigation";
import * as z from "zod";

import { dashboardPathForRole } from "@/lib/auth/dal";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import { createClient } from "@/lib/supabase/server";

const SignUpSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
});

const SignInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export type AuthFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

// Self-service signup is client-only by design — preparer/admin accounts are
// provisioned by an admin (see Phase 6). The handle_new_auth_user trigger
// creates the matching public.users row (role='client' default) synchronously
// as part of this call, so there's nothing else to do before redirecting.
export async function signUp(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const validated = SignUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { name, email, password } = validated.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) {
    return { message: error.message };
  }

  redirect(safeRedirectPath(formData.get("next")) ?? "/dashboard");
}

export async function signIn(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const validated = SignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { email, password } = validated.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { message: "Invalid email or password." };
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", data.user.id).single();

  redirect(safeRedirectPath(formData.get("next")) ?? dashboardPathForRole(profile?.role ?? "client"));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

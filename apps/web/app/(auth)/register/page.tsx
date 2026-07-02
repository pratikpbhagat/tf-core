import { redirect } from "next/navigation";

import { dashboardPathForRole, getSessionUser } from "@/lib/auth/dal";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";

import { RegisterForm } from "./register-form";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function RegisterPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const safeNext = safeRedirectPath(next);

  const user = await getSessionUser();
  if (user) redirect(safeNext ?? dashboardPathForRole(user.role));

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Create your TaxFlow India account</h1>
      <RegisterForm next={safeNext} />
    </div>
  );
}

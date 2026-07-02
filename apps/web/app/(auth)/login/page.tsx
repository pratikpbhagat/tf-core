import { redirect } from "next/navigation";

import { dashboardPathForRole, getSessionUser } from "@/lib/auth/dal";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";

import { LoginForm } from "./login-form";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const safeNext = safeRedirectPath(next);

  const user = await getSessionUser();
  if (user) redirect(safeNext ?? dashboardPathForRole(user.role));

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Sign in to TaxFlow India</h1>
      <LoginForm next={safeNext} />
    </div>
  );
}

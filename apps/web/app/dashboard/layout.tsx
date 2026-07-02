import Link from "next/link";

import { LogoutButton } from "@/components/logout-button";
import { requireRole } from "@/lib/auth/dal";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  await requireRole("client");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <Link href="/dashboard" className="text-sm font-medium">
          TaxFlow India
        </Link>
        <LogoutButton />
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}

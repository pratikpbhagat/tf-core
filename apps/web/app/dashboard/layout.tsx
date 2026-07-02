import Link from "next/link";

import { LogoutButton } from "@/components/logout-button";
import { Logo } from "@/components/ui/logo";
import { requireRole } from "@/lib/auth/dal";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  await requireRole("client");

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-border bg-background px-6 py-3">
        <Link href="/dashboard">
          <Logo />
        </Link>
        <LogoutButton />
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}

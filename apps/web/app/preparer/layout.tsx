import Link from "next/link";

import { LogoutButton } from "@/components/logout-button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { requireRole } from "@/lib/auth/dal";

export default async function PreparerLayout({ children }: { children: React.ReactNode }) {
  await requireRole("preparer");

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-border bg-background px-6 py-3">
        <div className="flex items-center gap-3">
          <Link href="/preparer/dashboard">
            <Logo />
          </Link>
          <Badge tone="info">Preparer</Badge>
        </div>
        <LogoutButton />
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}

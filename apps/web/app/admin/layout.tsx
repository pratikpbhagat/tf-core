import Link from "next/link";

import { LogoutButton } from "@/components/logout-button";
import { requireRole } from "@/lib/auth/dal";

const NAV_LINKS = [
  { href: "/admin/dashboard", label: "Filings" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/deadlines", label: "Deadlines" },
  { href: "/admin/staff", label: "Staff" },
  { href: "/admin/analytics", label: "Deadline risk" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("admin");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="font-medium">
              {link.label}
            </Link>
          ))}
        </nav>
        <LogoutButton />
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}

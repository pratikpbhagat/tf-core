import { CalendarBlank, ChartLine, Files, SquaresFour, Users } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { LogoutButton } from "@/components/logout-button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { NavLink } from "@/components/ui/nav-link";
import { requireRole } from "@/lib/auth/dal";

const NAV_LINKS = [
  { href: "/admin/dashboard", label: "Filings", icon: Files },
  { href: "/admin/services", label: "Services", icon: SquaresFour },
  { href: "/admin/deadlines", label: "Deadlines", icon: CalendarBlank },
  { href: "/admin/staff", label: "Staff", icon: Users },
  { href: "/admin/analytics", label: "Deadline risk", icon: ChartLine },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("admin");

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-border bg-background px-6 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/admin/dashboard">
            <Logo />
          </Link>
          <Badge tone="neutral">Admin</Badge>
        </div>
        <nav className="flex flex-wrap items-center gap-x-1 gap-y-2 text-sm">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} icon={<link.icon weight="bold" className="h-4 w-4" />}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <LogoutButton />
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}

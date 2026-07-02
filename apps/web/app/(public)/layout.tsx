import { MagnifyingGlass, SignIn, SquaresFour } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { NavLink } from "@/components/ui/nav-link";

// Deliberately session-agnostic (no cookies()/getSessionUser() call) so pages
// under this route group stay eligible for static generation + ISR. A
// logged-in user clicking "Sign in" just gets bounced to their dashboard by
// the login page itself (see app/(auth)/login/page.tsx).
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-border bg-background/80 px-6 py-3 backdrop-blur-sm">
        <Link href="/" className="whitespace-nowrap">
          <Logo />
        </Link>
        <nav className="flex flex-wrap items-center gap-x-1 gap-y-2 text-sm">
          <NavLink href="/services" icon={<SquaresFour weight="bold" className="h-4 w-4" />}>
            Services
          </NavLink>
          <NavLink href="/track" icon={<MagnifyingGlass weight="bold" className="h-4 w-4" />}>
            Track filing
          </NavLink>
          <NavLink href="/login" icon={<SignIn weight="bold" className="h-4 w-4" />}>
            Sign in
          </NavLink>
          <Link href="/register" className={buttonVariants({ size: "sm", className: "ml-2" })}>
            Get started
          </Link>
        </nav>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      <footer className="border-t border-border px-6 py-4 text-xs text-muted-foreground">
        TaxFlow India — a portfolio project. Not a real tax filing service.
      </footer>
    </div>
  );
}

import Link from "next/link";

// Deliberately session-agnostic (no cookies()/getSessionUser() call) so pages
// under this route group stay eligible for static generation + ISR. A
// logged-in user clicking "Sign in" just gets bounced to their dashboard by
// the login page itself (see app/(auth)/login/page.tsx).
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <Link href="/" className="text-lg font-semibold whitespace-nowrap">
          TaxFlow India
        </Link>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <Link href="/services">Services</Link>
          <Link href="/track">Track filing</Link>
          <Link href="/login">Sign in</Link>
          <Link href="/register" className="rounded-md bg-foreground px-3 py-1.5 text-background">
            Get started
          </Link>
        </nav>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      <footer className="border-t border-zinc-200 px-6 py-4 text-xs text-zinc-500 dark:border-zinc-800">
        TaxFlow India — a portfolio project. Not a real tax filing service.
      </footer>
    </div>
  );
}

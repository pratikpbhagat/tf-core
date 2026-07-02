"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

type NavLinkProps = ComponentProps<typeof Link> & {
  icon?: ReactNode;
  exact?: boolean;
};

export function NavLink({ href, icon, exact = false, className, children, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const hrefStr = href.toString();
  const isActive = exact ? pathname === hrefStr : pathname === hrefStr || pathname.startsWith(`${hrefStr}/`);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors duration-150",
        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </Link>
  );
}

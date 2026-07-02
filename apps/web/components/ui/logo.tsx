import { Receipt } from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-base font-semibold tracking-tight text-foreground", className)}>
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Receipt weight="bold" className="h-4.5 w-4.5" />
      </span>
      TaxFlow India
    </span>
  );
}

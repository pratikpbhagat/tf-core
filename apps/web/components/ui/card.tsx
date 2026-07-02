import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function cardVariants({ interactive = false, className }: { interactive?: boolean; className?: string } = {}) {
  return cn(
    "rounded-xl border border-border bg-card text-card-foreground shadow-sm",
    interactive && "transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
    className,
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cardVariants({ className })} {...props} />;
}

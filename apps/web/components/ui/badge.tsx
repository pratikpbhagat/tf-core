import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type BadgeTone = "info" | "attention" | "caution" | "success" | "danger" | "neutral";

const TONE_CLASSES: Record<BadgeTone, string> = {
  info: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
  attention: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  caution: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  danger: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
  neutral: "border-border bg-muted text-muted-foreground",
};

export const TONE_DOT_CLASSES: Record<BadgeTone, string> = {
  info: "bg-blue-500",
  attention: "bg-amber-500",
  caution: "bg-orange-500",
  success: "bg-emerald-500",
  danger: "bg-red-500",
  neutral: "bg-zinc-400",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone };

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    />
  );
}

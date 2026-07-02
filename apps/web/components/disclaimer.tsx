import { Info } from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/cn";

export function IllustrativeDisclaimer({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200",
        className,
      )}
    >
      <Info weight="bold" className="mt-0.5 h-3.5 w-3.5 flex-none" />
      <span>
        <strong>Illustrative content.</strong> This is portfolio/demo data, not tax advice — verify current
        eligibility, deadlines, and pricing before relying on it.
      </span>
    </p>
  );
}

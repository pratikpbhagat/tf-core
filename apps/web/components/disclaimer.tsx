export function IllustrativeDisclaimer({ className = "" }: { className?: string }) {
  return (
    <p
      className={`rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200 ${className}`}
    >
      <strong>Illustrative content.</strong> This is portfolio/demo data, not tax advice — verify current
      eligibility, deadlines, and pricing before relying on it.
    </p>
  );
}

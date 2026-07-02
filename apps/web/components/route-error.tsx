"use client";

type Props = { error: Error & { digest?: string }; reset: () => void };

export function RouteError({ error, reset }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-400">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <button type="button" onClick={reset} className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background">
        Try again
      </button>
    </div>
  );
}

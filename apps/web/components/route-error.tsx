"use client";

import { ArrowClockwise, WarningCircle } from "@phosphor-icons/react/dist/ssr";

import { Button } from "@/components/ui/button";

type Props = { error: Error & { digest?: string }; reset: () => void };

export function RouteError({ error, reset }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <WarningCircle weight="bold" className="h-6 w-6" />
      </span>
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <Button type="button" onClick={reset}>
        <ArrowClockwise weight="bold" className="h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}

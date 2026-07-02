"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function TrackForm() {
  const router = useRouter();
  const [code, setCode] = useState("");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = code.trim();
        if (trimmed) router.push(`/track/${encodeURIComponent(trimmed)}`);
      }}
      className="flex w-full max-w-sm items-center gap-2"
    >
      <label htmlFor="tracking-code" className="sr-only">
        Tracking code
      </label>
      <input
        id="tracking-code"
        name="code"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        placeholder="TF-2025-XXXXXXXX"
        required
        className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
      <button type="submit" className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background">
        Track
      </button>
    </form>
  );
}

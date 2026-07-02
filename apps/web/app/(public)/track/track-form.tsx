"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <Input
        id="tracking-code"
        name="code"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        placeholder="TF-2025-XXXXXXXX"
        required
        className="flex-1"
      />
      <Button type="submit">Track</Button>
    </form>
  );
}

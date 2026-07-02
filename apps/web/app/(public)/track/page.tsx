import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";

import { TrackForm } from "./track-form";

export const metadata = { title: "Track your filing — TaxFlow India" };

export default function TrackPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <MagnifyingGlass weight="bold" className="h-6 w-6" />
      </span>
      <h1 className="text-2xl font-semibold">Track your filing</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Enter the tracking code from your filing confirmation to see its status — no login required.
      </p>
      <TrackForm />
    </div>
  );
}

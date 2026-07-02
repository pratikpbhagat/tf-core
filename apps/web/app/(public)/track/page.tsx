import { TrackForm } from "./track-form";

export const metadata = { title: "Track your filing — TaxFlow India" };

export default function TrackPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">Track your filing</h1>
      <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-400">
        Enter the tracking code from your filing confirmation to see its status — no login required.
      </p>
      <TrackForm />
    </div>
  );
}

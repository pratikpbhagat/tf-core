import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-400">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link href="/" className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background">
        Back to home
      </Link>
    </div>
  );
}

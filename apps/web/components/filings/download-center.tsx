import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";

type DownloadItem = { label: string; signedUrl: string | null };

export function DownloadCenter({ items }: { items: DownloadItem[] }) {
  const available = items.filter(
    (item): item is { label: string; signedUrl: string } => item.signedUrl !== null,
  );

  if (available.length === 0) {
    return <p className="text-sm text-muted-foreground">Nothing to download yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {available.map((item) => (
        <li key={item.label}>
          <a
            href={item.signedUrl}
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <DownloadSimple weight="bold" className="h-4 w-4" />
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

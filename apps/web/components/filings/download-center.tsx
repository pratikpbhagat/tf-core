type DownloadItem = { label: string; signedUrl: string | null };

export function DownloadCenter({ items }: { items: DownloadItem[] }) {
  const available = items.filter(
    (item): item is { label: string; signedUrl: string } => item.signedUrl !== null,
  );

  if (available.length === 0) {
    return <p className="text-sm text-zinc-500">Nothing to download yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {available.map((item) => (
        <li key={item.label}>
          <a href={item.signedUrl} target="_blank" rel="noreferrer" className="text-sm font-medium underline">
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

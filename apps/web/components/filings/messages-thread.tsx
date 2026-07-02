type MessageEntry = {
  id: string;
  message: string;
  created_at: string;
  senderName: string;
  isOwn: boolean;
  isInternal?: boolean;
};

export function MessagesThread({ messages }: { messages: MessageEntry[] }) {
  if (messages.length === 0) {
    return <p className="text-sm text-zinc-500">No messages yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((entry) => (
        <div
          key={entry.id}
          className={`max-w-[85%] rounded-md border px-3 py-2 text-sm ${
            entry.isInternal
              ? "self-start border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
              : entry.isOwn
                ? "self-end border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900"
                : "self-start border-zinc-200 dark:border-zinc-800"
          }`}
        >
          <p className="mb-1 text-xs font-medium text-zinc-500">
            {entry.isOwn ? "You" : entry.senderName}
            {entry.isInternal && " · Internal note"}
          </p>
          <p>{entry.message}</p>
          <p className="mt-1 text-[10px] text-zinc-400">
            {new Date(entry.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
      ))}
    </div>
  );
}

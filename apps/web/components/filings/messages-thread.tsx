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
    return <p className="text-sm text-muted-foreground">No messages yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((entry) => (
        <div
          key={entry.id}
          className={`flex max-w-[85%] flex-col gap-1 rounded-md border px-3 py-2 text-sm ${
            entry.isInternal
              ? "self-start border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
              : entry.isOwn
                ? "self-end border-primary/30 bg-primary/5"
                : "self-start border-border bg-card"
          }`}
        >
          <p className="text-xs font-medium text-muted-foreground">
            {entry.isOwn ? "You" : entry.senderName}
            {entry.isInternal && " · Internal note"}
          </p>
          <p>{entry.message}</p>
          <p className="text-[10px] text-muted-foreground">
            {new Date(entry.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
      ))}
    </div>
  );
}

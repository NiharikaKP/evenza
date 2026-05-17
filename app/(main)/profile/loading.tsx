export default function Loading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 animate-pulse space-y-8">
      {/* Heading */}
      <div className="h-9 w-36 rounded bg-muted" />

      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg border bg-muted/40 p-1 w-fit">
        <div className="h-8 w-28 rounded-md bg-muted" />
        <div className="h-8 w-32 rounded-md bg-muted" />
      </div>

      {/* Profile info card */}
      <div className="rounded-xl border bg-card p-6 space-y-6">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-24 rounded bg-muted" />
              <div className="h-10 w-full rounded-md bg-muted" />
            </div>
          ))}
        </div>
        <div className="h-10 w-32 rounded-md bg-muted" />
      </div>
    </main>
  );
}

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse space-y-8">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-9 w-56 rounded bg-muted" />
          <div className="h-4 w-72 rounded bg-muted" />
        </div>
        <div className="h-10 w-32 rounded-md bg-muted" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6 space-y-3">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-8 w-16 rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Events table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-4 border-b">
          <div className="h-6 w-28 rounded bg-muted" />
        </div>
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-4">
              <div className="h-4 w-48 rounded bg-muted" />
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-4 w-32 rounded bg-muted ml-auto" />
              <div className="h-8 w-20 rounded-md bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

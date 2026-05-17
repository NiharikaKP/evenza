export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse space-y-6">
      {/* Heading */}
      <div className="space-y-2">
        <div className="h-9 w-36 rounded bg-muted" />
        <div className="h-4 w-80 rounded bg-muted" />
      </div>

      {/* Tab bar (4 tabs) */}
      <div className="grid grid-cols-4 gap-1 rounded-lg border bg-muted/40 p-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 rounded-md bg-muted" />
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Table header */}
        <div className="flex gap-4 px-4 py-3 border-b bg-muted/30">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-4 w-40 rounded bg-muted" />
          <div className="h-4 w-24 rounded bg-muted ml-auto" />
          <div className="h-4 w-20 rounded bg-muted" />
        </div>
        {/* Table rows */}
        <div className="divide-y">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
              <div className="h-4 w-36 rounded bg-muted" />
              <div className="h-4 w-48 rounded bg-muted" />
              <div className="h-6 w-20 rounded-full bg-muted ml-auto" />
              <div className="h-8 w-8 rounded-md bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

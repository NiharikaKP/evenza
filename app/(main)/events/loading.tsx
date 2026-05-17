export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 animate-pulse space-y-8">
      {/* Page header */}
      <div className="space-y-2">
        <div className="h-9 w-28 rounded bg-muted" />
        <div className="h-4 w-52 rounded bg-muted" />
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-3">
        <div className="h-10 w-64 rounded-md bg-muted" />
        <div className="h-10 w-40 rounded-md bg-muted" />
        <div className="h-10 w-40 rounded-md bg-muted" />
        <div className="h-10 w-32 rounded-md bg-muted" />
      </div>

      {/* Result count */}
      <div className="h-4 w-24 rounded bg-muted" />

      {/* Event cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden border bg-card space-y-0">
            <div className="h-40 w-full bg-muted" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-4/5 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-3 pt-4">
        <div className="h-8 w-24 rounded-md bg-muted" />
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-8 w-20 rounded-md bg-muted" />
      </div>
    </main>
  );
}

export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 animate-pulse space-y-8">
      {/* Page header */}
      <div className="space-y-2">
        <div className="h-9 w-24 rounded bg-muted" />
        <div className="h-4 w-64 rounded bg-muted" />
      </div>

      {/* Club cards grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden border bg-card">
            <div className="h-32 w-full bg-muted" />
            <div className="p-4 space-y-2">
              <div className="h-5 w-3/4 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

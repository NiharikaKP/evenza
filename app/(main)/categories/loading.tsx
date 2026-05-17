export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 animate-pulse space-y-8">
      {/* Page header */}
      <div className="space-y-2">
        <div className="h-9 w-40 rounded bg-muted" />
        <div className="h-4 w-72 rounded bg-muted" />
      </div>

      {/* Category cards grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-muted" />
        ))}
      </div>
    </main>
  );
}

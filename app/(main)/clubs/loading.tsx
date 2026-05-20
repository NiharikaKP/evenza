export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 animate-pulse space-y-8">
      {/* Page header */}
      <div className="space-y-2">
        <div className="h-9 w-24 rounded bg-muted" />
        <div className="h-4 w-64 rounded bg-muted" />
      </div>

      {/* Club cards grid — overflow avatar layout */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="pt-10 relative">
            {/* Circular avatar overflowing the top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-20 w-20 rounded-full bg-muted ring-4 ring-background" />
            <div className="rounded-xl border bg-card pt-12 pb-4 px-4 text-center space-y-2">
              <div className="h-5 w-3/4 rounded bg-muted mx-auto" />
              <div className="h-4 w-1/2 rounded-full bg-muted mx-auto" />
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-4/5 rounded bg-muted mx-auto" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
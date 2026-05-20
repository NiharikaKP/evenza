export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 animate-pulse space-y-10">
      {/* Club header */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="h-32 w-32 rounded-full bg-muted ring-4 ring-background" />
        <div className="space-y-2">
          <div className="h-9 w-48 rounded bg-muted mx-auto" />
          <div className="h-5 w-20 rounded-full bg-muted mx-auto" />
          <div className="h-4 w-80 rounded bg-muted mx-auto" />
          <div className="h-4 w-64 rounded bg-muted mx-auto" />
        </div>
      </div>

      {/* Events section */}
      <div className="space-y-4">
        <div className="h-7 w-48 rounded bg-muted" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden border bg-card">
              <div className="h-40 w-full bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-5 w-3/4 rounded bg-muted" />
                <div className="h-4 w-1/2 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-4/5 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
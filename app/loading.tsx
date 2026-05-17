export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Hero carousel */}
      <div className="h-64 w-full bg-muted sm:h-96" />

      <div className="mx-auto max-w-7xl px-4 py-12 space-y-16">
        {/* Categories */}
        <section className="space-y-6">
          <div className="h-8 w-72 rounded bg-muted" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-muted" />
            ))}
          </div>
        </section>

        {/* Live events */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-8 w-44 rounded bg-muted" />
            <div className="h-8 w-20 rounded bg-muted" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-muted" />
            ))}
          </div>
        </section>

        {/* Upcoming events */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-8 w-32 rounded bg-muted" />
            <div className="h-8 w-20 rounded bg-muted" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-muted" />
            ))}
          </div>
        </section>

        {/* Clubs */}
        <section className="space-y-6">
          <div className="h-8 w-28 rounded bg-muted" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 rounded-xl bg-muted" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl animate-pulse space-y-6">
      {/* Back button + heading */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-md bg-muted shrink-0" />
        <div className="space-y-1">
          <div className="h-8 w-40 rounded bg-muted" />
          <div className="h-4 w-56 rounded bg-muted" />
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        {/* Title + Venue */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="h-4 w-12 rounded bg-muted" />
            <div className="h-10 w-full rounded-md bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-12 rounded bg-muted" />
            <div className="h-10 w-full rounded-md bg-muted" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-20 w-full rounded-md bg-muted" />
        </div>

        {/* Category + Club */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-10 w-full rounded-md bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-12 rounded bg-muted" />
            <div className="h-10 w-full rounded-md bg-muted" />
          </div>
        </div>

        {/* Start + End time */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-10 w-full rounded-md bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-10 w-full rounded-md bg-muted" />
          </div>
        </div>

        {/* Seats + Drive URL */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-10 w-full rounded-md bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-36 rounded bg-muted" />
            <div className="h-10 w-full rounded-md bg-muted" />
          </div>
        </div>

        {/* Banner image */}
        <div className="space-y-2">
          <div className="h-4 w-28 rounded bg-muted" />
          <div className="h-10 w-36 rounded-md bg-muted" />
        </div>

        {/* Custom fields header */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-44 rounded bg-muted" />
          <div className="h-8 w-28 rounded-md bg-muted" />
        </div>

        {/* Submit */}
        <div className="h-10 w-32 rounded-md bg-muted" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 animate-pulse space-y-8">
      {/* Banner */}
      <div className="h-56 w-full rounded-xl bg-muted md:h-72" />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full bg-muted" />
          <div className="h-6 w-24 rounded-full bg-muted" />
        </div>
        <div className="h-10 w-3/4 rounded bg-muted" />
        <div className="h-4 w-52 rounded bg-muted" />
      </div>

      {/* Body */}
      <div className="grid gap-8 md:grid-cols-3">
        {/* Main — date/venue box + description */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded bg-muted shrink-0" />
              <div className="h-4 w-48 rounded bg-muted" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded bg-muted shrink-0" />
              <div className="h-4 w-36 rounded bg-muted" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded bg-muted shrink-0" />
              <div className="h-4 w-40 rounded bg-muted" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-6 w-40 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
            <div className="h-4 w-4/6 rounded bg-muted" />
          </div>
        </div>

        {/* Sidebar — registration card */}
        <div className="space-y-4">
          <div className="rounded-lg border p-5 space-y-4">
            <div className="h-5 w-28 rounded bg-muted" />
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-10 w-full rounded-md bg-muted" />
          </div>
        </div>
      </div>
    </main>
  );
}

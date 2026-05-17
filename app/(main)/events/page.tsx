import Link from 'next/link';
import { getEvents } from '@/lib/queries/events';
import { getClubs } from '@/lib/queries/clubs';
import { getCategories } from '@/lib/queries/categories';
import { EventCard } from '@/components/shared/EventCard';
import { EventFilters } from '@/components/events/EventFilters';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type SearchParams = Promise<{
  q?: string;
  status?: string;
  category?: string;
  club?: string;
  page?: string;
}>;

export default async function EventsPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, status, category, club, page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const [{ data: events, total, totalPages }, categories, clubs] = await Promise.all([
    getEvents({
      q,
      status,
      categoryId: category,
      clubId: club,
      page: currentPage,
      pageSize: 12,
    }),
    getCategories(),
    getClubs(),
  ]);

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    if (category) params.set('category', category);
    if (club) params.set('club', club);
    params.set('page', String(p));
    return `/events?${params.toString()}`;
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Events</h1>
        <p className="text-muted-foreground">Browse all campus events</p>
      </div>

      <EventFilters
        categories={categories}
        clubs={clubs}
        currentQ={q}
        currentStatus={status}
        currentCategory={category}
        currentClub={club}
      />

      {events.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground">
            {total} event{total !== 1 ? 's' : ''} found
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                asChild
                disabled={currentPage <= 1}
              >
                <Link href={buildPageUrl(currentPage - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Link>
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                asChild
                disabled={currentPage >= totalPages}
              >
                <Link href={buildPageUrl(currentPage + 1)}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <p className="text-xl font-semibold">No events found</p>
          <p className="text-muted-foreground text-sm">
            Try adjusting your filters or search term.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/events">Clear filters</Link>
          </Button>
        </div>
      )}
    </main>
  );
}

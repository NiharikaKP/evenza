import Link from 'next/link';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getFeaturedEvents, getLiveEvents, getUpcomingEvents } from '@/lib/queries/events';
import { getClubs } from '@/lib/queries/clubs';
import { getCategories } from '@/lib/queries/categories';
import { EventCard } from '@/components/shared/EventCard';
import { ClubCard } from '@/components/shared/ClubCard';
import { CategoryCard } from '@/components/shared/CategoryCard';
import { HeroCarousel } from '@/components/shared/HeroCarousel';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const [featuredEvents, liveEvents, upcomingEvents, categories, clubs, session] =
    await Promise.all([
      getFeaturedEvents(),
      getLiveEvents(4),
      getUpcomingEvents(4),
      getCategories(),
      getClubs(),
      auth.api.getSession({ headers: await headers() }),
    ]);

  const userInterests: string[] = (session?.user as any)?.interests ?? [];

  return (
    <main>
      {/* Hero */}
      <section>
        <HeroCarousel events={featuredEvents} />
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 space-y-16">
        {/* Categories */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Discover Events You&apos;ll Love</h2>
          {categories.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {categories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  highlighted={userInterests.includes(cat.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No categories yet.</p>
          )}
        </section>

        {/* Live Events */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Happening Now</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/events?status=live">View All</Link>
            </Button>
          </div>
          {liveEvents.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {liveEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No events happening right now.</p>
          )}
        </section>

        {/* Upcoming Events */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Coming Up</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/events?status=upcoming">View All</Link>
            </Button>
          </div>
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No upcoming events at the moment.</p>
          )}
        </section>

        {/* Clubs */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Our Clubs</h2>
          {clubs.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {clubs.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No clubs yet.</p>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-12">
        <div className="mx-auto max-w-7xl px-4 py-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <span className="text-lg font-bold">EVENZA</span>
          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/events" className="hover:text-foreground transition-colors">Events</Link>
            <Link href="/clubs" className="hover:text-foreground transition-colors">Clubs</Link>
            <Link href="/categories" className="hover:text-foreground transition-colors">Categories</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}

import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getClub } from '@/lib/queries/clubs';
import { getEvents } from '@/lib/queries/events';
import { EventCard } from '@/components/shared/EventCard';
import { Badge } from '@/components/ui/badge';
import { getClubColor, isPlaceholderImage } from '@/lib/utils';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const club = await getClub(id);
  if (!club) return { title: 'Club not found — EVENZA' };
  return { title: `${club.name} — EVENZA` };
}

export default async function ClubDetailPage({ params }: Props) {
  const { id } = await params;
  const [club, { data: events }] = await Promise.all([
    getClub(id),
    getEvents({ clubId: id, pageSize: 50 }),
  ]);

  if (!club) notFound();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 space-y-10">
      {/* Club header */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="h-32 w-32 rounded-full overflow-hidden ring-4 ring-background shadow-lg">
          {!isPlaceholderImage(club.imageUrl) ? (
            <Image
              src={club.imageUrl!}
              alt={club.name}
              width={128}
              height={128}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className={`flex h-full items-center justify-center bg-gradient-to-br ${getClubColor(club.name)}`}
            >
              <span className="text-4xl font-bold text-white/90 select-none">
                {club.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{club.name}</h1>
          {club.category && (
            <Badge variant="secondary">{club.category.name}</Badge>
          )}
          {club.description && (
            <p className="text-muted-foreground max-w-xl mx-auto">
              {club.description}
            </p>
          )}
        </div>
      </div>

      {/* Events */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Events by {club.name}</h2>
        {events.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No events from this club yet.</p>
        )}
      </div>
    </main>
  );
}
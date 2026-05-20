import type { Metadata } from 'next';
import { getClubs } from '@/lib/queries/clubs';
import { ClubCard } from '@/components/shared/ClubCard';

export const metadata: Metadata = { title: 'Clubs — EVENZA' };

export default async function ClubsPage() {
  const clubs = await getClubs();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Clubs</h1>
        <p className="text-muted-foreground">
          Explore all clubs and their events.
        </p>
      </div>

      {clubs.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {clubs.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No clubs have been added yet.</p>
      )}
    </main>
  );
}
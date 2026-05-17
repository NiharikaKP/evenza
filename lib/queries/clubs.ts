import { cache } from 'react';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { clubs } from '@/lib/db/schema';

export type ClubWithCategory = Awaited<ReturnType<typeof getClub>>;
export type ClubRow = Awaited<ReturnType<typeof getClubs>>[number];

export const getClubs = cache(async () => {
  return db.query.clubs.findMany({
    with: { category: true },
    orderBy: (clubs, { asc }) => [asc(clubs.name)],
  });
});

export const getClub = cache(async (id: string) => {
  return db.query.clubs.findFirst({
    where: eq(clubs.id, id),
    with: { category: true },
  });
});

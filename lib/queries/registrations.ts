import { cache } from 'react';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { registrations } from '@/lib/db/schema';

export type RegistrationWithEvent = Awaited<ReturnType<typeof getRegistrationsByUser>>[number];

export const getRegistrationByUserAndEvent = cache(
  async (userId: string, eventId: string) => {
    return db.query.registrations.findFirst({
      where: and(eq(registrations.userId, userId), eq(registrations.eventId, eventId)),
    });
  },
);

export const getRegistrationsByUser = cache(async (userId: string) => {
  return db.query.registrations.findMany({
    where: eq(registrations.userId, userId),
    with: {
      event: {
        with: { club: true, category: true },
      },
    },
    orderBy: [desc(registrations.registeredAt)],
  });
});

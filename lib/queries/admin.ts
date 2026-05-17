import { cache } from 'react';
import { eq, ilike, or, desc, gt } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, organizerClubs, events } from '@/lib/db/schema';

export type AdminUser = Awaited<ReturnType<typeof getAllUsers>>[number];
export type AdminEvent = Awaited<ReturnType<typeof getAllEvents>>[number];

export const getAllUsers = cache(async (search?: string) => {
  const rows = await db.query.users.findMany({
    orderBy: [desc(users.createdAt)],
  });

  if (!search) return rows;

  const q = search.toLowerCase();
  return rows.filter(
    (u) =>
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
  );
});

export const getOrganizerClubAssignments = cache(async (organizerId: string) => {
  const rows = await db.query.organizerClubs.findMany({
    where: eq(organizerClubs.organizerId, organizerId),
    with: { club: true },
  });
  return rows.map((r) => r.club);
});

export const getAllEvents = cache(async (search?: string) => {
  const now = new Date();
  const rows = await db.query.events.findMany({
    with: { club: true, category: true },
    orderBy: [desc(events.createdAt)],
  });

  const active = rows.filter((e) => !e.isCancelled && e.endTime > now);

  if (!search) return active;

  const q = search.toLowerCase();
  return active.filter(
    (e) =>
      e.title.toLowerCase().includes(q) ||
      e.club.name.toLowerCase().includes(q),
  );
});

import { cache } from 'react';
import { and, count, eq, gte, lte } from 'drizzle-orm';
import { db } from '@/lib/db';
import { events, organizerClubs, registrations } from '@/lib/db/schema';

export type OrganizerEvent = Awaited<ReturnType<typeof getOrganizerEvents>>[number];
export type OrganizerStats = Awaited<ReturnType<typeof getOrganizerStats>>;
export type OrganizerClub = Awaited<ReturnType<typeof getOrganizerClubs>>[number];
export type EventAttendee = Awaited<ReturnType<typeof getEventAttendees>>[number];

export const getOrganizerEvents = cache(async (organizerId: string) => {
  const rows = await db.query.events.findMany({
    where: eq(events.organizerId, organizerId),
    with: { club: true, category: true, registrations: true },
    orderBy: (e, { desc }) => [desc(e.createdAt)],
  });

  return rows.map((e) => ({
    ...e,
    registrationCount: e.registrations.length,
  }));
});

export const getOrganizerStats = cache(async (organizerId: string) => {
  const now = new Date();

  const allEvents = await db.query.events.findMany({
    where: eq(events.organizerId, organizerId),
    with: { registrations: true },
  });

  const totalEvents = allEvents.length;
  const totalRegistrations = allEvents.reduce((sum, e) => sum + e.registrations.length, 0);
  const activeEvents = allEvents.filter(
    (e) => !e.isCancelled && e.startTime <= now && e.endTime >= now,
  ).length;

  return { totalEvents, totalRegistrations, activeEvents };
});

export const getOrganizerClubs = cache(async (organizerId: string) => {
  const rows = await db.query.organizerClubs.findMany({
    where: eq(organizerClubs.organizerId, organizerId),
    with: { club: true },
  });
  return rows.map((r) => r.club);
});

export const getOrganizerEvent = cache(async (eventId: string, organizerId: string) => {
  const event = await db.query.events.findFirst({
    where: and(eq(events.id, eventId), eq(events.organizerId, organizerId)),
    with: { club: true, category: true, registrations: true },
  });
  if (!event) return null;
  return { ...event, registrationCount: event.registrations.length };
});

export const getEventAttendees = cache(async (eventId: string, organizerId: string) => {
  const event = await db.query.events.findFirst({
    where: and(eq(events.id, eventId), eq(events.organizerId, organizerId)),
  });
  if (!event) throw new Error('Event not found or not owned by this organizer');

  const rows = await db.query.registrations.findMany({
    where: eq(registrations.eventId, eventId),
    with: { user: true },
    orderBy: (r, { asc }) => [asc(r.registeredAt)],
  });

  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    name: r.user.name,
    email: r.user.email,
    registeredAt: r.registeredAt,
    attended: r.attended,
    scanned: r.scanned,
    qrToken: r.qrToken,
    customResponses: r.customResponses,
  }));
});

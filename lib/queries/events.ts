import { cache } from 'react';
import { and, count, desc, eq, gt, gte, ilike, lt, lte, or } from 'drizzle-orm';
import { db } from '@/lib/db';
import { events, clubs, registrations } from '@/lib/db/schema';

export type EventWithRelations = Awaited<ReturnType<typeof getEvent>>;
export type EventRow = Awaited<ReturnType<typeof getEvents>>['data'][number];

export const getEvents = cache(
  async ({
    q,
    status,
    categoryId,
    clubId,
    page = 1,
    pageSize = 12,
  }: {
    q?: string;
    status?: string;
    categoryId?: string;
    clubId?: string;
    page?: number;
    pageSize?: number;
  } = {}) => {
    const now = new Date();
    const conditions = [];

    if (q) {
      conditions.push(
        or(ilike(events.title, `%${q}%`), ilike(events.description, `%${q}%`)),
      );
    }
    if (categoryId) conditions.push(eq(events.categoryId, categoryId));
    if (clubId) conditions.push(eq(events.clubId, clubId));

    if (status === 'live') {
      conditions.push(lte(events.startTime, now), gte(events.endTime, now), eq(events.isCancelled, false));
    } else if (status === 'upcoming') {
      conditions.push(gt(events.startTime, now), eq(events.isCancelled, false));
    } else if (status === 'past') {
      conditions.push(lt(events.endTime, now), eq(events.isCancelled, false));
    } else if (status === 'cancelled') {
      conditions.push(eq(events.isCancelled, true));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, totalResult] = await Promise.all([
      db.query.events.findMany({
        where,
        with: { club: true, category: true },
        orderBy: [desc(events.startTime)],
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }),
      db.select({ count: count() }).from(events).where(where),
    ]);

    const total = totalResult[0]?.count ?? 0;
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  },
);

export const getEvent = cache(async (id: string) => {
  return db.query.events.findFirst({
    where: eq(events.id, id),
    with: { club: true, category: true },
  });
});

export const getFeaturedEvents = cache(async () => {
  return db.query.events.findMany({
    where: and(eq(events.isFeatured, true), eq(events.isCancelled, false)),
    with: { club: true, category: true },
    orderBy: [desc(events.createdAt)],
  });
});

export const getLiveEvents = cache(async (limit = 4) => {
  const now = new Date();
  return db.query.events.findMany({
    where: and(lte(events.startTime, now), gte(events.endTime, now), eq(events.isCancelled, false)),
    with: { club: true, category: true },
    orderBy: [desc(events.startTime)],
    limit,
  });
});

export const getUpcomingEvents = cache(async (limit = 4) => {
  const now = new Date();
  return db.query.events.findMany({
    where: and(gt(events.startTime, now), eq(events.isCancelled, false)),
    with: { club: true, category: true },
    orderBy: [desc(events.startTime)],
    limit,
  });
});

export const getRegistrationCount = cache(async (eventId: string) => {
  const result = await db
    .select({ count: count() })
    .from(registrations)
    .where(eq(registrations.eventId, eventId));
  return result[0]?.count ?? 0;
});

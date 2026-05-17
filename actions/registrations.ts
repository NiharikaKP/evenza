'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { events, registrations } from '@/lib/db/schema';
import { and, count, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function registerForEvent(
  eventId: string,
  customResponses: { label: string; value: string }[],
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  const event = await db.query.events.findFirst({ where: eq(events.id, eventId) });
  if (!event) throw new Error('Event not found');
  if (event.isCancelled) throw new Error('This event has been cancelled');

  const now = new Date();
  if (now > event.endTime) throw new Error('This event has already ended');

  const [{ registrationCount }] = await db
    .select({ registrationCount: count() })
    .from(registrations)
    .where(eq(registrations.eventId, eventId));

  if (registrationCount >= event.totalSeats) throw new Error('Event is full');

  const existing = await db.query.registrations.findFirst({
    where: and(eq(registrations.eventId, eventId), eq(registrations.userId, session.user.id)),
  });
  if (existing) throw new Error('Already registered for this event');

  const requiredFields = (event.customFields ?? []).filter((f) => f.required);
  for (const field of requiredFields) {
    const response = customResponses.find((r) => r.label === field.label);
    if (!response || !response.value.trim()) {
      throw new Error(`"${field.label}" is required`);
    }
  }

  await db.insert(registrations).values({
    eventId,
    userId: session.user.id,
    customResponses,
  });

  revalidatePath(`/events/${eventId}`);
  revalidatePath('/profile');
  return { success: true };
}

export async function unregisterFromEvent(eventId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  const event = await db.query.events.findFirst({ where: eq(events.id, eventId) });
  if (!event) throw new Error('Event not found');

  const now = new Date();
  if (now >= event.startTime) throw new Error('Cannot unregister after event has started');

  await db
    .delete(registrations)
    .where(and(eq(registrations.eventId, eventId), eq(registrations.userId, session.user.id)));

  revalidatePath(`/events/${eventId}`);
  revalidatePath('/profile');
  return { success: true };
}

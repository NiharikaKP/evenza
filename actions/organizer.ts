'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { events, organizerClubs, registrations } from '@/lib/db/schema';
import { and, count, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getEventAttendees } from '@/lib/queries/organizer';

type CustomField = { label: string; required: boolean };

type EventData = {
  title: string;
  description: string;
  venue: string;
  categoryId: string;
  clubId: string;
  startTime: string;
  endTime: string;
  totalSeats: number;
  googleDriveUrl?: string;
  imageUrl?: string;
  customFields: CustomField[];
};

async function getAuthorizedSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');
  if (!['organizer', 'admin'].includes(session.user.role)) throw new Error('Forbidden');
  return session;
}

async function verifyOrganizerClub(organizerId: string, clubId: string) {
  const assignment = await db.query.organizerClubs.findFirst({
    where: and(
      eq(organizerClubs.organizerId, organizerId),
      eq(organizerClubs.clubId, clubId),
    ),
  });
  if (!assignment) throw new Error('You are not assigned to this club');
}

function validateEventData(data: EventData) {
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new Error('Invalid date');
  if (end <= start) throw new Error('End time must be after start time');
  if (data.totalSeats < 1) throw new Error('Total seats must be at least 1');
  if (data.customFields.length > 5) throw new Error('Maximum 5 custom fields allowed');
  return { start, end };
}

export async function createEvent(data: EventData) {
  const session = await getAuthorizedSession();
  await verifyOrganizerClub(session.user.id, data.clubId);
  const { start, end } = validateEventData(data);

  const [inserted] = await db
    .insert(events)
    .values({
      title: data.title,
      description: data.description,
      venue: data.venue,
      categoryId: data.categoryId,
      clubId: data.clubId,
      organizerId: session.user.id,
      startTime: start,
      endTime: end,
      totalSeats: data.totalSeats,
      googleDriveUrl: data.googleDriveUrl || null,
      imageUrl: data.imageUrl || null,
      customFields: data.customFields,
    })
    .returning({ eventId: events.id });

  revalidatePath('/organizer');
  return { eventId: inserted.eventId };
}

export async function updateEvent(eventId: string, data: EventData) {
  const session = await getAuthorizedSession();

  const event = await db.query.events.findFirst({
    where: and(eq(events.id, eventId), eq(events.organizerId, session.user.id)),
  });
  if (!event) throw new Error('Event not found or not owned by you');

  const { start, end } = validateEventData(data);

  const [{ regCount }] = await db
    .select({ regCount: count() })
    .from(registrations)
    .where(eq(registrations.eventId, eventId));

  if (data.totalSeats < regCount) {
    throw new Error(
      `Cannot reduce seats below current registration count (${regCount})`,
    );
  }

  await db
    .update(events)
    .set({
      title: data.title,
      description: data.description,
      venue: data.venue,
      categoryId: data.categoryId,
      clubId: data.clubId,
      startTime: start,
      endTime: end,
      totalSeats: data.totalSeats,
      googleDriveUrl: data.googleDriveUrl || null,
      imageUrl: data.imageUrl !== undefined ? (data.imageUrl || null) : undefined,
      customFields: data.customFields,
    })
    .where(eq(events.id, eventId));

  revalidatePath('/organizer');
  revalidatePath(`/events/${eventId}`);
}

export async function cancelEvent(eventId: string) {
  const session = await getAuthorizedSession();

  const event = await db.query.events.findFirst({
    where: and(eq(events.id, eventId), eq(events.organizerId, session.user.id)),
  });
  if (!event) throw new Error('Event not found or not owned by you');

  await db.update(events).set({ isCancelled: true }).where(eq(events.id, eventId));

  revalidatePath('/organizer');
  revalidatePath(`/events/${eventId}`);
}

export async function fetchEventAttendees(eventId: string) {
  const session = await getAuthorizedSession();
  return getEventAttendees(eventId, session.user.id);
}

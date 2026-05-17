'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { users, clubs, categories, organizerClubs, events } from '@/lib/db/schema';
import { and, count, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');
  if (session.user.role !== 'admin') throw new Error('Forbidden');
  return session;
}

export async function setUserRole(
  userId: string,
  role: 'student' | 'organizer' | 'admin',
) {
  const session = await getAdminSession();
  if (session.user.id === userId) throw new Error('Cannot change your own role');

  await db.update(users).set({ role }).where(eq(users.id, userId));
  revalidatePath('/admin');
}

export async function createClub(data: {
  name: string;
  description?: string;
  categoryId: string;
  imageUrl?: string;
}) {
  await getAdminSession();

  await db.insert(clubs).values({
    name: data.name,
    description: data.description || null,
    categoryId: data.categoryId,
    imageUrl: data.imageUrl || null,
  });

  revalidatePath('/admin');
  revalidatePath('/clubs');
}

export async function updateClub(
  clubId: string,
  data: { name: string; description?: string; categoryId: string; imageUrl?: string },
) {
  await getAdminSession();

  await db
    .update(clubs)
    .set({
      name: data.name,
      description: data.description || null,
      categoryId: data.categoryId,
      imageUrl: data.imageUrl || null,
    })
    .where(eq(clubs.id, clubId));

  revalidatePath('/admin');
  revalidatePath('/clubs');
}

export async function deleteClub(clubId: string) {
  await getAdminSession();

  const [{ eventCount }] = await db
    .select({ eventCount: count() })
    .from(events)
    .where(eq(events.clubId, clubId));

  if (eventCount > 0) {
    throw new Error('Cannot delete club with existing events');
  }

  await db.delete(clubs).where(eq(clubs.id, clubId));

  revalidatePath('/admin');
  revalidatePath('/clubs');
}

export async function createCategory(name: string) {
  await getAdminSession();

  await db.insert(categories).values({ name });

  revalidatePath('/admin');
  revalidatePath('/categories');
}

export async function updateCategory(categoryId: string, name: string) {
  await getAdminSession();

  await db.update(categories).set({ name }).where(eq(categories.id, categoryId));

  revalidatePath('/admin');
  revalidatePath('/categories');
}

export async function deleteCategory(categoryId: string) {
  await getAdminSession();

  const [{ clubCount }] = await db
    .select({ clubCount: count() })
    .from(clubs)
    .where(eq(clubs.categoryId, categoryId));

  const [{ eventCount }] = await db
    .select({ eventCount: count() })
    .from(events)
    .where(eq(events.categoryId, categoryId));

  if (clubCount > 0 || eventCount > 0) {
    throw new Error('Cannot delete category that has clubs or events');
  }

  await db.delete(categories).where(eq(categories.id, categoryId));

  revalidatePath('/admin');
  revalidatePath('/categories');
}

export async function assignClubToOrganizer(organizerId: string, clubId: string) {
  await getAdminSession();

  const organizer = await db.query.users.findFirst({ where: eq(users.id, organizerId) });
  if (!organizer || !['organizer', 'admin'].includes(organizer.role)) {
    throw new Error('User is not an organizer or admin');
  }

  await db
    .insert(organizerClubs)
    .values({ organizerId, clubId })
    .onConflictDoNothing();

  revalidatePath('/admin');
}

export async function removeClubFromOrganizer(organizerId: string, clubId: string) {
  await getAdminSession();

  await db
    .delete(organizerClubs)
    .where(
      and(eq(organizerClubs.organizerId, organizerId), eq(organizerClubs.clubId, clubId)),
    );

  revalidatePath('/admin');
}

export async function fetchOrganizerClubs(organizerId: string) {
  await getAdminSession();
  const rows = await db.query.organizerClubs.findMany({
    where: eq(organizerClubs.organizerId, organizerId),
    with: { club: true },
  });
  return rows.map((r) => ({ id: r.club.id, name: r.club.name }));
}

export async function setEventFeatured(eventId: string, isFeatured: boolean) {
  await getAdminSession();

  await db.update(events).set({ isFeatured }).where(eq(events.id, eventId));

  revalidatePath('/admin');
  revalidatePath('/');
}

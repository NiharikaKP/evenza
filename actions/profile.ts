'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function completeOnboarding(data: {
  rollNumber: string;
  department: string;
  year: string;
  interests: string[];
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  await db
    .update(users)
    .set({
      rollNumber: data.rollNumber,
      department: data.department,
      year: data.year,
      interests: data.interests,
      onboardingComplete: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.user.id));

  redirect('/');
}

export async function updateProfile(data: {
  name: string;
  rollNumber: string;
  department: string;
  year: string;
  interests: string[];
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  await db
    .update(users)
    .set({
      name: data.name,
      rollNumber: data.rollNumber,
      department: data.department,
      year: data.year,
      interests: data.interests,
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.user.id));

  revalidatePath('/profile');
}

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getRegistrationsByUser } from '@/lib/queries/registrations';
import { getCategories } from '@/lib/queries/categories';
import { ProfileTabs } from '@/components/profile/ProfileTabs';

export const metadata = { title: 'My Profile — EVENZA' };

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/sign-in');

  const [userRecord, registrations, categories] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, session.user.id) }),
    getRegistrationsByUser(session.user.id),
    getCategories(),
  ]);

  if (!userRecord) redirect('/sign-in');

  const serializedRegistrations = registrations.map((reg) => ({
    id: reg.id,
    qrToken: reg.qrToken,
    event: {
      id: reg.event.id,
      title: reg.event.title,
      venue: reg.event.venue,
      startTime: reg.event.startTime.toISOString(),
      endTime: reg.event.endTime.toISOString(),
      isCancelled: reg.event.isCancelled,
      isFeatured: reg.event.isFeatured,
      totalSeats: reg.event.totalSeats,
      club: reg.event.club
        ? { name: reg.event.club.name, imageUrl: reg.event.club.imageUrl }
        : null,
      category: reg.event.category ? { name: reg.event.category.name } : null,
    },
  }));

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      <ProfileTabs
        user={{
          name: userRecord.name,
          email: userRecord.email,
          rollNumber: userRecord.rollNumber,
          department: userRecord.department,
          year: userRecord.year,
          interests: userRecord.interests as string[] | null,
        }}
        categories={categories}
        registrations={serializedRegistrations}
      />
    </main>
  );
}

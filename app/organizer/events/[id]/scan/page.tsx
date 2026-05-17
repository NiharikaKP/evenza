import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { QRScanner } from '@/components/organizer/QRScanner';

export default async function ScanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !['organizer', 'admin'].includes(session.user.role)) {
    redirect('/');
  }

  const event = await db.query.events.findFirst({
    where: eq(events.id, id),
  });

  if (!event || event.isCancelled) {
    notFound();
  }

  // Organizers can only scan their own events (admins can scan any)
  if (session.user.role === 'organizer' && event.organizerId !== session.user.id) {
    notFound();
  }

  return (
    <QRScanner
      eventId={event.id}
      eventTitle={event.title}
      eventStartTime={event.startTime.toISOString()}
      eventEndTime={event.endTime.toISOString()}
    />
  );
}

import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getOrganizerEvent, getOrganizerClubs } from '@/lib/queries/organizer';
import { getCategories } from '@/lib/queries/categories';
import { EditEventForm } from '@/components/organizer/EditEventForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !['organizer', 'admin'].includes(session.user.role)) {
    redirect('/');
  }

  const [event, organizerClubs, categories] = await Promise.all([
    getOrganizerEvent(id, session.user.id),
    getOrganizerClubs(session.user.id),
    getCategories(),
  ]);

  if (!event) notFound();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/organizer">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Event</h1>
          <p className="text-muted-foreground mt-1">{event.title}</p>
        </div>
      </div>

      <EditEventForm event={event} organizerClubs={organizerClubs} categories={categories} />
    </div>
  );
}

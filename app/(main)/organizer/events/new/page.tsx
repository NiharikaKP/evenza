import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getOrganizerClubs } from '@/lib/queries/organizer';
import { getCategories } from '@/lib/queries/categories';
import { CreateEventForm } from '@/components/organizer/CreateEventForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default async function NewEventPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !['organizer', 'admin'].includes(session.user.role)) {
    redirect('/');
  }

  const [organizerClubs, categories] = await Promise.all([
    getOrganizerClubs(session.user.id),
    getCategories(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/organizer">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Event</h1>
          <p className="text-muted-foreground mt-1">Fill in the details to publish a new event</p>
        </div>
      </div>

      <CreateEventForm organizerClubs={organizerClubs} categories={categories} redirectTo="/organizer" />
    </div>
  );
}

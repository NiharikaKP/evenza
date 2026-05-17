import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getOrganizerStats, getOrganizerEvents, getOrganizerClubs } from '@/lib/queries/organizer';
import { getCategories } from '@/lib/queries/categories';
import { StatsCards } from '@/components/organizer/StatsCards';
import { EventsTable } from '@/components/organizer/EventsTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function OrganizerPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !['organizer', 'admin'].includes(session.user.role)) {
    redirect('/');
  }

  const [stats, organizerEvents, organizerClubs, categories] = await Promise.all([
    getOrganizerStats(session.user.id),
    getOrganizerEvents(session.user.id),
    getOrganizerClubs(session.user.id),
    getCategories(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your events and track registrations</p>
        </div>
        <Button asChild>
          <Link href="/organizer/events/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Link>
        </Button>
      </div>

      <StatsCards stats={stats} />

      <EventsTable
        events={organizerEvents}
        organizerClubs={organizerClubs}
        categories={categories}
      />
    </div>
  );
}

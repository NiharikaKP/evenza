import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getEvent, getRegistrationCount } from '@/lib/queries/events';
import { getRegistrationByUserAndEvent } from '@/lib/queries/registrations';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { EventRegistrationSection } from '@/components/events/EventRegistrationSection';
import { getEventStatus, getClubColor, isPlaceholderImage } from '@/lib/utils';
import { CalendarDays, Clock, ExternalLink, MapPin } from 'lucide-react';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return { title: 'Event Not Found' };
  return {
    title: `${event.title} — EVENZA`,
    description: event.description.slice(0, 160),
  };
}

export default async function EventDetailPage({ params }: { params: Params }) {
  const { id } = await params;

  const [event, session] = await Promise.all([
    getEvent(id),
    auth.api.getSession({ headers: await headers() }),
  ]);

  if (!event) notFound();

  const [registrationCount, registration] = await Promise.all([
    getRegistrationCount(event.id),
    session ? getRegistrationByUserAndEvent(session.user.id, event.id) : null,
  ]);

  const status = getEventStatus({
    startTime: event.startTime,
    endTime: event.endTime,
    isCancelled: event.isCancelled,
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      {/* Banner image */}
      <div className="relative h-56 w-full overflow-hidden rounded-xl md:h-72">
        {!isPlaceholderImage(event.imageUrl) ? (
          <Image
            src={event.imageUrl!}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
        ) : event.club && !isPlaceholderImage(event.club.imageUrl) ? (
          <Image
            src={event.club.imageUrl!}
            alt={event.club.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div
            className={`flex h-full items-center justify-center bg-gradient-to-br ${getClubColor(event.club?.name ?? event.title)}`}
          >
            <span className="text-6xl font-bold text-white/90 select-none">
              {(event.club?.name ?? event.title).slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={status} />
          {event.category && (
            <Link href={`/events?category=${event.categoryId}`}>
              <Badge variant="outline" className="hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
                {event.category.name}
              </Badge>
            </Link>
          )}
        </div>
        <h1 className="text-3xl font-bold">{event.title}</h1>
        {event.club && (
          <p className="text-muted-foreground">
            Organised by{' '}
            <Link
              href={`/events?club=${event.clubId}`}
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              {event.club.name}
            </Link>
          </p>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Main info */}
        <div className="md:col-span-2 space-y-6">
          {/* Date/time/venue */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-start gap-3">
              <CalendarDays className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">
                  {event.startTime.toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <p>
                {event.startTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                {' → '}
                {event.endTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <p>{event.venue}</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">About this event</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Google Drive */}
          {event.googleDriveUrl && (
            <a
              href={event.googleDriveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              View Resources
            </a>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <EventRegistrationSection
            event={{
              id: event.id,
              totalSeats: event.totalSeats,
              customFields: event.customFields,
              isCancelled: event.isCancelled,
              startTime: event.startTime,
              endTime: event.endTime,
            }}
            registration={registration ? { id: registration.id, qrToken: registration.qrToken } : null}
            registrationCount={registrationCount}
            status={status}
            isAuthenticated={!!session}
          />
        </div>
      </div>
    </main>
  );
}

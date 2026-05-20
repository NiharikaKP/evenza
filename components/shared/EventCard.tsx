import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, ExternalLink, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { getEventStatus, getClubColor, isPlaceholderImage } from '@/lib/utils';

type EventCardProps = {
  event: {
    id: string;
    title: string;
    imageUrl?: string | null;
    venue: string;
    startTime: Date;
    endTime: Date;
    totalSeats: number;
    isCancelled: boolean;
    isFeatured: boolean;
    googleDriveUrl?: string | null;
    club: { name: string; imageUrl: string | null } | null;
    category: { name: string } | null;
  };
  registeredCount?: number;
};

export function EventCard({ event, registeredCount }: EventCardProps) {
  const status = getEventStatus({
    startTime: event.startTime,
    endTime: event.endTime,
    isCancelled: event.isCancelled,
  });

  const seatsLeft =
    registeredCount !== undefined ? event.totalSeats - registeredCount : null;

  return (
    <div className="group block h-full relative">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
          {!isPlaceholderImage(event.imageUrl) ? (
            <Image
              src={event.imageUrl!}
              alt={event.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : event.club && !isPlaceholderImage(event.club.imageUrl) ? (
            <Image
              src={event.club.imageUrl!}
              alt={event.club.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div
              className={`flex h-full items-center justify-center bg-gradient-to-br ${getClubColor(event.club?.name ?? event.title)} transition-transform group-hover:scale-105`}
            >
              <span className="text-3xl font-bold text-white/90 select-none">
                {(event.club?.name ?? event.title).slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {event.title}
            </h3>
            <StatusBadge status={status} />
          </div>
          {event.club && (
            <p className="text-sm text-muted-foreground">{event.club.name}</p>
          )}
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-1.5">
          {event.category && (
            <Badge variant="secondary" className="text-xs">
              {event.category.name}
            </Badge>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            <span>
              {event.startTime.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
          {seatsLeft !== null && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span>{seatsLeft} seats left</span>
            </div>
          )}
          {event.googleDriveUrl && (
            <div className="pt-2 mt-1 border-t">
              <a
                href={event.googleDriveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                View Gallery
              </a>
            </div>
          )}
        </CardContent>
      </Card>
      <Link href={`/events/${event.id}`} className="absolute inset-0" aria-label={event.title} />
    </div>
  );
}
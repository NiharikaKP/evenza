'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { cancelEvent } from '@/actions/organizer';
import { getEventStatus } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { AttendeesViewer } from '@/components/organizer/AttendeesViewer';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { OrganizerEvent, OrganizerClub } from '@/lib/queries/organizer';
import type { CategoryRow } from '@/lib/queries/categories';

export function EventsTable({
  events,
  organizerClubs,
  categories,
}: {
  events: OrganizerEvent[];
  organizerClubs: OrganizerClub[];
  categories: CategoryRow[];
}) {
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [attendeeEventId, setAttendeeEventId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function handleCancel() {
    if (!cancelTarget) return;
    setError('');
    startTransition(async () => {
      try {
        await cancelEvent(cancelTarget);
        setCancelTarget(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to cancel event');
      }
    });
  }

  if (attendeeEventId) {
    const event = events.find((e) => e.id === attendeeEventId);
    return (
      <AttendeesViewer
        eventId={attendeeEventId}
        eventTitle={event?.title ?? ''}
        onBack={() => setAttendeeEventId(null)}
      />
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your Events</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Club</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No events yet. Create one using the button above.
                    </TableCell>
                  </TableRow>
                )}
                {events.map((event) => {
                  const status = getEventStatus(event);
                  const isCancelled = status === 'cancelled';
                  return (
                    <TableRow key={event.id} className={cn(isCancelled && 'opacity-50')}>
                      <TableCell className="font-medium max-w-[180px] truncate">
                        <Link href={`/events/${event.id}`} className="hover:underline">
                          {event.title}
                        </Link>
                      </TableCell>
                      <TableCell>{event.club.name}</TableCell>
                      <TableCell>{event.category.name}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Date(event.startTime).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {event.registrationCount}/{event.totalSeats}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setAttendeeEventId(event.id)}
                          >
                            Attendees
                          </Button>
                          {status === 'live' ? (
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/organizer/events/${event.id}/scan`}>Scan QR</Link>
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled
                              title="Only available during event"
                            >
                              Scan QR
                            </Button>
                          )}
                          {!isCancelled && (
                            <>
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/organizer/events/${event.id}/edit`}>Edit</Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setCancelTarget(event.id)}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Cancel confirmation dialog */}
      <Dialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Event</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to cancel this event? This action cannot be undone and all
            registered students will see it marked as Cancelled.
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)}>
              Keep Event
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isPending}>
              {isPending ? 'Cancelling…' : 'Yes, Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

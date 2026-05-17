'use client';

import { useEffect, useState, useTransition } from 'react';
import { fetchEventAttendees } from '@/actions/organizer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import type { EventAttendee } from '@/lib/queries/organizer';

export function AttendeesViewer({
  eventId,
  eventTitle,
  onBack,
}: {
  eventId: string;
  eventTitle: string;
  onBack: () => void;
}) {
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        const data = await fetchEventAttendees(eventId);
        setAttendees(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load attendees');
      }
    });
  }, [eventId]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>Attendees — {eventTitle}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isPending && (
          <p className="text-center text-muted-foreground py-8">Loading attendees…</p>
        )}
        {error && (
          <p className="text-center text-destructive py-8">{error}</p>
        )}
        {!isPending && !error && attendees.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No registrations yet for this event.
          </p>
        )}
        {!isPending && !error && attendees.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Registered At</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Custom Responses</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendees.map((a, i) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell>{a.email}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {new Date(a.registeredAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {a.attended ? (
                        <Badge variant="outline" className="bg-green-500/15 text-green-700 border-green-500/30">
                          Attended
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Not Yet
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {(a.customResponses ?? []).length === 0 ? (
                        <span className="text-muted-foreground text-sm">—</span>
                      ) : (
                        <div className="space-y-1">
                          {(a.customResponses ?? []).map((r, j) => (
                            <p key={j} className="text-sm">
                              <span className="font-medium">{r.label}:</span> {r.value}
                            </p>
                          ))}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

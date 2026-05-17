'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CustomFieldsModal } from './CustomFieldsModal';
import { unregisterFromEvent } from '@/actions/registrations';
import { Users } from 'lucide-react';

type EventStatus = 'upcoming' | 'live' | 'past' | 'cancelled';

type CustomField = { label: string; required: boolean };

type Registration = {
  id: string;
  qrToken: string;
} | null;

interface EventRegistrationSectionProps {
  event: {
    id: string;
    totalSeats: number;
    customFields: CustomField[] | null;
    isCancelled: boolean;
    startTime: Date;
    endTime: Date;
  };
  registration: Registration;
  registrationCount: number;
  status: EventStatus;
  isAuthenticated: boolean;
}

export function EventRegistrationSection({
  event,
  registration,
  registrationCount,
  status,
  isAuthenticated,
}: EventRegistrationSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(registration !== null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const capacityPct = Math.round((registrationCount / event.totalSeats) * 100);
  const seatsLeft = event.totalSeats - registrationCount;
  const isFull = seatsLeft <= 0 && !isRegistered;
  const customFields = event.customFields ?? [];

  function handleRegisterClick() {
    setError(null);
    if (customFields.length > 0) {
      setModalOpen(true);
    } else {
      startTransition(async () => {
        try {
          const { registerForEvent } = await import('@/actions/registrations');
          await registerForEvent(event.id, []);
          setIsRegistered(true);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Registration failed');
        }
      });
    }
  }

  function handleUnregister() {
    if (!confirm('Are you sure you want to unregister from this event?')) return;
    setError(null);
    startTransition(async () => {
      try {
        await unregisterFromEvent(event.id);
        setIsRegistered(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unregistration failed');
      }
    });
  }

  function renderButton() {
    if (!isAuthenticated) {
      return (
        <Button className="w-full" asChild variant="outline">
          <Link href="/sign-in">Sign in to Register</Link>
        </Button>
      );
    }
    if (status === 'cancelled') {
      return <Button className="w-full" disabled>Cancelled</Button>;
    }
    if (status === 'past') {
      return <Button className="w-full" disabled>Event Ended</Button>;
    }
    if (isFull && !isRegistered) {
      return <Button className="w-full" disabled>Full</Button>;
    }
    if (isRegistered) {
      return (
        <div className="space-y-2">
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white" disabled>
            Registered ✓
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Your QR ticket is ready —{' '}
            <Link href="/profile" className="underline underline-offset-2 hover:text-foreground transition-colors">
              view in My Events
            </Link>
          </p>
          <button
            onClick={handleUnregister}
            disabled={isPending}
            className="w-full text-sm text-muted-foreground hover:text-destructive underline underline-offset-2 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Unregistering…' : 'Unregister'}
          </button>
        </div>
      );
    }
    return (
      <Button className="w-full" onClick={handleRegisterClick} disabled={isPending}>
        {isPending ? 'Registering…' : 'Register'}
      </Button>
    );
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span>Capacity</span>
      </div>
      <Progress value={capacityPct} className="h-2" />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{registrationCount} registered</span>
        <span>{event.totalSeats} total</span>
      </div>
      {isFull ? (
        <p className="text-sm font-medium text-destructive">Event is full</p>
      ) : (
        <p className="text-sm text-muted-foreground">{seatsLeft} seats left</p>
      )}

      <div className="pt-1">
        {renderButton()}
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </div>

      {customFields.length > 0 && (
        <CustomFieldsModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          eventId={event.id}
          customFields={customFields}
          onSuccess={() => setIsRegistered(true)}
        />
      )}
    </div>
  );
}

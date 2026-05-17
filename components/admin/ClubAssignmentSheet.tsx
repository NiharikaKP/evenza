'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { assignClubToOrganizer, removeClubFromOrganizer } from '@/actions/admin';

type Club = { id: string; name: string };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizer: { id: string; name: string };
  allClubs: Club[];
  assignedClubIds: string[];
}

export function ClubAssignmentSheet({
  open,
  onOpenChange,
  organizer,
  allClubs,
  assignedClubIds: initialAssigned,
}: Props) {
  const [assigned, setAssigned] = useState<Set<string>>(new Set(initialAssigned));
  const [pending, startTransition] = useTransition();

  function handleToggle(clubId: string, checked: boolean) {
    startTransition(async () => {
      if (checked) {
        await assignClubToOrganizer(organizer.id, clubId);
        setAssigned((prev) => new Set([...prev, clubId]));
      } else {
        await removeClubFromOrganizer(organizer.id, clubId);
        setAssigned((prev) => {
          const next = new Set(prev);
          next.delete(clubId);
          return next;
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Clubs — {organizer.name}</DialogTitle>
          <DialogDescription>
            Toggle clubs to assign or remove them. Changes apply immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-3">
          {allClubs.map((club) => (
            <div key={club.id} className="flex items-center gap-3">
              <Checkbox
                id={`club-${club.id}`}
                checked={assigned.has(club.id)}
                onCheckedChange={(checked) => handleToggle(club.id, !!checked)}
                disabled={pending}
              />
              <Label htmlFor={`club-${club.id}`} className="cursor-pointer">
                {club.name}
              </Label>
            </div>
          ))}

          {allClubs.length === 0 && (
            <p className="text-sm text-muted-foreground">No clubs exist yet.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

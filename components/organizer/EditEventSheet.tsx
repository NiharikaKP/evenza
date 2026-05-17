'use client';

import { useState, useTransition } from 'react';
import { updateEvent } from '@/actions/organizer';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import type { OrganizerEvent, OrganizerClub } from '@/lib/queries/organizer';
import type { CategoryRow } from '@/lib/queries/categories';

type CustomField = { label: string; required: boolean };

function toLocalDatetime(date: Date | string): string {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EditEventSheet({
  event,
  organizerClubs,
  categories,
  open,
  onClose,
}: {
  event: OrganizerEvent;
  organizerClubs: OrganizerClub[];
  categories: CategoryRow[];
  open: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: event.title,
    description: event.description,
    venue: event.venue,
    categoryId: event.categoryId,
    clubId: event.clubId,
    startTime: toLocalDatetime(event.startTime),
    endTime: toLocalDatetime(event.endTime),
    totalSeats: event.totalSeats,
    googleDriveUrl: event.googleDriveUrl ?? '',
  });
  const [customFields, setCustomFields] = useState<CustomField[]>(event.customFields ?? []);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPending, startTransition] = useTransition();

  function set(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addField() {
    if (customFields.length >= 5) return;
    setCustomFields((prev) => [...prev, { label: '', required: false }]);
  }

  function updateField(index: number, patch: Partial<CustomField>) {
    setCustomFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  function removeField(index: number) {
    setCustomFields((prev) => prev.filter((_, i) => i !== index));
  }

  function validate(): string {
    if (!form.title.trim()) return 'Title is required';
    if (!form.description.trim()) return 'Description is required';
    if (!form.venue.trim()) return 'Venue is required';
    if (!form.categoryId) return 'Category is required';
    if (!form.clubId) return 'Club is required';
    if (!form.startTime) return 'Start date/time is required';
    if (!form.endTime) return 'End date/time is required';
    if (new Date(form.endTime) <= new Date(form.startTime))
      return 'End time must be after start time';
    if (form.totalSeats < 1) return 'Total seats must be at least 1';
    if (form.totalSeats < event.registrationCount)
      return `Cannot reduce seats below current registration count (${event.registrationCount})`;
    if (form.googleDriveUrl && !/^https?:\/\/.+/.test(form.googleDriveUrl))
      return 'Google Drive URL must be a valid URL';
    for (const f of customFields) {
      if (!f.label.trim()) return 'All custom field labels must be filled';
    }
    return '';
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    startTransition(async () => {
      try {
        await updateEvent(event.id, { ...form, customFields });
        setSuccess('Event updated successfully!');
        setTimeout(onClose, 1000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update event');
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Edit Event</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title *</Label>
            <Input
              id="edit-title"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description *</Label>
            <Textarea
              id="edit-description"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-venue">Venue *</Label>
            <Input
              id="edit-venue"
              value={form.venue}
              onChange={(e) => set('venue', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={form.categoryId} onValueChange={(v) => set('categoryId', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Club *</Label>
              <Select value={form.clubId} onValueChange={(v) => set('clubId', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {organizerClubs.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-start">Start Date & Time *</Label>
              <Input
                id="edit-start"
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => set('startTime', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-end">End Date & Time *</Label>
              <Input
                id="edit-end"
                type="datetime-local"
                value={form.endTime}
                onChange={(e) => set('endTime', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-seats">
              Total Seats * (current registrations: {event.registrationCount})
            </Label>
            <Input
              id="edit-seats"
              type="number"
              min={event.registrationCount}
              value={form.totalSeats}
              onChange={(e) => set('totalSeats', Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-drive">Google Drive URL (optional)</Label>
            <Input
              id="edit-drive"
              type="url"
              value={form.googleDriveUrl}
              onChange={(e) => set('googleDriveUrl', e.target.value)}
              placeholder="https://drive.google.com/..."
            />
          </div>

          {/* Custom Fields */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Custom Registration Fields</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addField}
                disabled={customFields.length >= 5}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Field {customFields.length}/5
              </Button>
            </div>

            {customFields.map((field, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-md">
                <Input
                  placeholder="Field label"
                  value={field.label}
                  onChange={(e) => updateField(i, { label: e.target.value })}
                  className="flex-1"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <Label className="text-sm text-muted-foreground">Required</Label>
                  <Switch
                    checked={field.required}
                    onCheckedChange={(checked) => updateField(i, { required: checked })}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeField(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? 'Saving…' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

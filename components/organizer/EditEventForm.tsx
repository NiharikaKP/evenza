'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createEvent } from '@/actions/organizer';
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
import { ImageIcon, Plus, Trash2, X } from 'lucide-react';
import type { OrganizerClub } from '@/lib/queries/organizer';
import type { CategoryRow } from '@/lib/queries/categories';

type CustomField = { label: string; required: boolean };

const EMPTY_FORM = {
  title: '',
  description: '',
  venue: '',
  categoryId: '',
  clubId: '',
  startTime: '',
  endTime: '',
  totalSeats: 1,
  googleDriveUrl: '',
};

export function CreateEventForm({
  organizerClubs,
  categories,
  redirectTo,
}: {
  organizerClubs: OrganizerClub[];
  categories: CategoryRow[];
  redirectTo?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPending, startTransition] = useTransition();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (
      form.googleDriveUrl &&
      !/^https?:\/\/.+/.test(form.googleDriveUrl)
    )
      return 'Google Drive URL must be a valid URL';
    for (const f of customFields) {
      if (!f.label.trim()) return 'All custom field labels must be filled';
    }
    return '';
  }

  async function uploadFile(): Promise<string | null> {
    if (!fileToUpload) return null;
    const data = new FormData();
    data.append('file', fileToUpload);
    const res = await fetch('/api/upload?type=events', { method: 'POST', body: data });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error ?? 'Upload failed');
    return json.url as string;
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setFileError('Only JPEG, PNG, and WebP images are allowed');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFileError('File must be under 2MB');
      return;
    }
    setFileError('');
    setFileToUpload(file);
    setPreviewUrl(URL.createObjectURL(file));
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
        let imageUrl: string | undefined;
        if (fileToUpload) {
          const uploaded = await uploadFile();
          if (uploaded) imageUrl = uploaded;
        }
        await createEvent({
          ...form,
          customFields,
          imageUrl,
        });
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          setSuccess('Event created successfully!');
          setForm(EMPTY_FORM);
          setCustomFields([]);
          setFileToUpload(null);
          setPreviewUrl(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create event');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-card border rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Event title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">Venue *</Label>
              <Input
                id="venue"
                value={form.venue}
                onChange={(e) => set('venue', e.target.value)}
                placeholder="Event venue"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Describe your event"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={form.categoryId} onValueChange={(v) => set('categoryId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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
                  <SelectValue placeholder="Select club" />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Date & Time *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => set('startTime', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Date & Time *</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={form.endTime}
                onChange={(e) => set('endTime', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalSeats">Total Seats *</Label>
              <Input
                id="totalSeats"
                type="number"
                min={1}
                value={form.totalSeats}
                onChange={(e) => set('totalSeats', Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="googleDriveUrl">Google Drive URL (optional)</Label>
              <Input
                id="googleDriveUrl"
                type="url"
                value={form.googleDriveUrl}
                onChange={(e) => set('googleDriveUrl', e.target.value)}
                placeholder="https://drive.google.com/..."
              />
            </div>
          </div>

          {/* Banner Image */}
          <div className="space-y-2">
            <Label>
              Banner Image <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
            {previewUrl ? (
              <div className="relative w-full aspect-video rounded-md overflow-hidden border">
                <Image
                  src={previewUrl}
                  alt="Banner preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => { setFileToUpload(null); setPreviewUrl(null); }}
                  className="absolute top-2 right-2 bg-black/60 rounded-full p-1"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Upload Banner
              </Button>
            )}
            {fileError && <p className="text-sm text-destructive">{fileError}</p>}
          </div>

          {/* Custom Fields Builder */}
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

          <Button type="submit" disabled={isPending}>
            {isPending ? 'Creating…' : 'Create Event'}
          </Button>
    </form>
  );
}
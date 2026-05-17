'use client';

import { useTransition, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerForEvent } from '@/actions/registrations';

type CustomField = { label: string; required: boolean };

interface CustomFieldsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  customFields: CustomField[];
  onSuccess: () => void;
}

export function CustomFieldsModal({
  open,
  onOpenChange,
  eventId,
  customFields,
  onSuccess,
}: CustomFieldsModalProps) {
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  function handleChange(label: string, value: string) {
    setValues((prev) => ({ ...prev, [label]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    for (const field of customFields) {
      if (field.required && !values[field.label]?.trim()) {
        setError(`"${field.label}" is required`);
        return;
      }
    }

    const responses = customFields.map((f) => ({
      label: f.label,
      value: values[f.label] ?? '',
    }));

    startTransition(async () => {
      try {
        await registerForEvent(eventId, responses);
        onOpenChange(false);
        onSuccess();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Registration failed');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Registration</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {customFields.map((field) => (
            <div key={field.label} className="space-y-1.5">
              <Label htmlFor={field.label}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              <Input
                id={field.label}
                value={values[field.label] ?? ''}
                onChange={(e) => handleChange(field.label, e.target.value)}
                disabled={isPending}
                placeholder={field.required ? 'Required' : 'Optional'}
              />
            </div>
          ))}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Registering…' : 'Register'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

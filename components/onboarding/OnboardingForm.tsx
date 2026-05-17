'use client';

import { useState, useTransition } from 'react';
import { completeOnboarding } from '@/actions/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Category = { id: string; name: string };

const YEARS = [
  { value: '1st', label: '1st Year' },
  { value: '2nd', label: '2nd Year' },
  { value: '3rd', label: '3rd Year' },
  { value: '4th', label: '4th Year' },
  { value: 'alumni', label: 'Alumni' },
];

export function OnboardingForm({ categories }: { categories: Category[] }) {
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function toggleInterest(id: string) {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!rollNumber || !department || !year) {
      setError('Please fill in all required fields.');
      return;
    }

    startTransition(async () => {
      try {
        await completeOnboarding({ rollNumber, department, year, interests });
      } catch (err: unknown) {
        if (err instanceof Error && err.message !== 'NEXT_REDIRECT') {
          setError(err.message);
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="rollNumber">Roll Number</Label>
        <Input
          id="rollNumber"
          placeholder="e.g. CS2021001"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Input
          id="department"
          placeholder="e.g. Computer Science"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="year">Year</Label>
        <Select value={year} onValueChange={setYear} required>
          <SelectTrigger id="year">
            <SelectValue placeholder="Select your year" />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => (
              <SelectItem key={y.value} value={y.value}>
                {y.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {categories.length > 0 && (
        <div className="space-y-3">
          <Label>Interests (optional)</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2">
                <Checkbox
                  id={`cat-${cat.id}`}
                  checked={interests.includes(cat.id)}
                  onCheckedChange={() => toggleInterest(cat.id)}
                />
                <Label htmlFor={`cat-${cat.id}`} className="cursor-pointer font-normal">
                  {cat.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Saving…' : 'Complete Setup'}
      </Button>
    </form>
  );
}

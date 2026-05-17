'use client';

import { useState, useTransition } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { QRTicket } from '@/components/profile/QRTicket';
import { EventCard } from '@/components/shared/EventCard';
import { updateProfile } from '@/actions/profile';
import { getEventStatus } from '@/lib/utils';

type Category = { id: string; name: string };

type RegistrationItem = {
  id: string;
  qrToken: string;
  event: {
    id: string;
    title: string;
    venue: string;
    startTime: string;
    endTime: string;
    isCancelled: boolean;
    isFeatured: boolean;
    totalSeats: number;
    club: { name: string; imageUrl: string | null } | null;
    category: { name: string } | null;
  };
};

type UserData = {
  name: string;
  email: string;
  rollNumber: string | null;
  department: string | null;
  year: string | null;
  interests: string[] | null;
};

interface ProfileTabsProps {
  user: UserData;
  categories: Category[];
  registrations: RegistrationItem[];
}

const YEARS = [
  { value: '1st', label: '1st Year' },
  { value: '2nd', label: '2nd Year' },
  { value: '3rd', label: '3rd Year' },
  { value: '4th', label: '4th Year' },
  { value: 'alumni', label: 'Alumni' },
];

export function ProfileTabs({ user, categories, registrations }: ProfileTabsProps) {
  const [name, setName] = useState(user.name);
  const [rollNumber, setRollNumber] = useState(user.rollNumber ?? '');
  const [department, setDepartment] = useState(user.department ?? '');
  const [year, setYear] = useState(user.year ?? '');
  const [interests, setInterests] = useState<string[]>(user.interests ?? []);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function toggleInterest(id: string) {
    setInterests((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    setSaveError(null);
    startTransition(async () => {
      try {
        await updateProfile({ name, rollNumber, department, year, interests });
        setSaved(true);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Failed to save');
      }
    });
  }

  const now = new Date();

  const upcoming = registrations.filter((r) => {
    const status = getEventStatus({
      startTime: new Date(r.event.startTime),
      endTime: new Date(r.event.endTime),
      isCancelled: r.event.isCancelled,
    });
    return status === 'upcoming' || status === 'live';
  });

  const past = registrations.filter((r) => {
    const status = getEventStatus({
      startTime: new Date(r.event.startTime),
      endTime: new Date(r.event.endTime),
      isCancelled: r.event.isCancelled,
    });
    return status === 'past' || status === 'cancelled';
  });

  void now;

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="events">My Events</TabsTrigger>
      </TabsList>

      {/* Profile Tab */}
      <TabsContent value="profile">
        <form onSubmit={handleProfileSubmit} className="max-w-lg space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} disabled className="bg-muted" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rollNumber">Roll Number</Label>
            <Input
              id="rollNumber"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              disabled={isPending}
              placeholder="e.g. CS2021001"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={isPending}
              placeholder="e.g. Computer Science"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="year">Year</Label>
            <Select value={year} onValueChange={setYear} disabled={isPending}>
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
              <Label>Interests</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`cat-${cat.id}`}
                      checked={interests.includes(cat.id)}
                      onCheckedChange={() => toggleInterest(cat.id)}
                      disabled={isPending}
                    />
                    <Label htmlFor={`cat-${cat.id}`} className="cursor-pointer font-normal">
                      {cat.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {saveError && <p className="text-sm text-destructive">{saveError}</p>}
          {saved && <p className="text-sm text-green-600 dark:text-green-400">Changes saved!</p>}

          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        </form>
      </TabsContent>

      {/* My Events Tab */}
      <TabsContent value="events">
        {registrations.length === 0 ? (
          <p className="text-muted-foreground text-sm">You haven't registered for any events yet.</p>
        ) : (
          <div className="space-y-10">
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4">Upcoming &amp; Live</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start">
                  {upcoming.map((reg) => (
                    <div key={reg.id} className="space-y-3">
                      <EventCard
                        event={{
                          ...reg.event,
                          startTime: new Date(reg.event.startTime),
                          endTime: new Date(reg.event.endTime),
                        }}
                      />
                      <QRTicket
                        qrToken={reg.qrToken}
                        event={{
                          title: reg.event.title,
                          startTime: new Date(reg.event.startTime),
                          endTime: new Date(reg.event.endTime),
                          isCancelled: reg.event.isCancelled,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {upcoming.length > 0 && past.length > 0 && <Separator />}

            {past.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4">Past &amp; Cancelled</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start">
                  {past.map((reg) => (
                    <div key={reg.id} className="space-y-3">
                      <EventCard
                        event={{
                          ...reg.event,
                          startTime: new Date(reg.event.startTime),
                          endTime: new Date(reg.event.endTime),
                        }}
                      />
                      <QRTicket
                        qrToken={reg.qrToken}
                        event={{
                          title: reg.event.title,
                          startTime: new Date(reg.event.startTime),
                          endTime: new Date(reg.event.endTime),
                          isCancelled: reg.event.isCancelled,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

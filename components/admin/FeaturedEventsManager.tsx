'use client';

import { useState, useTransition } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { setEventFeatured } from '@/actions/admin';
import { cn } from '@/lib/utils';

type Event = {
  id: string;
  title: string;
  isFeatured: boolean;
  startTime: Date;
  club: { name: string };
  category: { name: string };
};

interface Props {
  events: Event[];
}

export function FeaturedEventsManager({ events: initialEvents }: Props) {
  const [featuredIds, setFeaturedIds] = useState<Set<string>>(
    new Set(initialEvents.filter((e) => e.isFeatured).map((e) => e.id)),
  );
  const [pending, startTransition] = useTransition();

  function handleToggle(eventId: string) {
    const isFeatured = !featuredIds.has(eventId);
    startTransition(async () => {
      await setEventFeatured(eventId, isFeatured);
      setFeaturedIds((prev) => {
        const next = new Set(prev);
        if (isFeatured) {
          next.add(eventId);
        } else {
          next.delete(eventId);
        }
        return next;
      });
    });
  }

  const featuredCount = featuredIds.size;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">Featured Events</h2>
        <Badge variant={featuredCount > 5 ? 'destructive' : 'secondary'}>
          {featuredCount} featured
          {featuredCount > 5 && ' — recommended max: 5'}
        </Badge>
      </div>

      <div className="border rounded-lg divide-y">
        {initialEvents.map((event) => {
          const isFeatured = featuredIds.has(event.id);
          return (
            <div key={event.id} className="flex items-center gap-4 px-4 py-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleToggle(event.id)}
                disabled={pending}
                title={isFeatured ? 'Remove from featured' : 'Add to featured'}
              >
                <Star
                  className={cn(
                    'h-5 w-5 transition-colors',
                    isFeatured ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground',
                  )}
                />
              </Button>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{event.title}</p>
                <p className="text-xs text-muted-foreground">
                  {event.club.name} · {event.category.name} ·{' '}
                  {new Date(event.startTime).toLocaleDateString()}
                </p>
              </div>

              {isFeatured && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-400">
                  Featured
                </Badge>
              )}
            </div>
          );
        })}

        {initialEvents.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No upcoming events available to feature.
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';

type FilterOption = { id: string; name: string };

type EventFiltersProps = {
  categories: FilterOption[];
  clubs: FilterOption[];
  currentQ?: string;
  currentStatus?: string;
  currentCategory?: string;
  currentClub?: string;
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'live', label: 'Live' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function EventFilters({
  categories,
  clubs,
  currentQ = '',
  currentStatus = 'all',
  currentCategory = '',
  currentClub = '',
}: EventFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value && value !== 'all') {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      params.delete('page');
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams],
  );

  const hasFilters = currentQ || (currentStatus && currentStatus !== 'all') || currentCategory || currentClub;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search events..."
          defaultValue={currentQ}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              updateParams({ q: (e.target as HTMLInputElement).value });
            }
          }}
          onBlur={(e) => {
            if (e.target.value !== currentQ) {
              updateParams({ q: e.target.value });
            }
          }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Status filter */}
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              size="sm"
              variant={
                (currentStatus || 'all') === opt.value ? 'default' : 'outline'
              }
              onClick={() => updateParams({ status: opt.value })}
            >
              {opt.label}
            </Button>
          ))}
        </div>

        {/* Category filter */}
        <Select
          value={currentCategory || '__all__'}
          onValueChange={(v) => updateParams({ category: v === '__all__' ? '' : v })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Club filter */}
        <Select
          value={currentClub || '__all__'}
          onValueChange={(v) => updateParams({ club: v === '__all__' ? '' : v })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Club" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Clubs</SelectItem>
            {clubs.map((club) => (
              <SelectItem key={club.id} value={club.id}>
                {club.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear filters */}
        {hasFilters && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              router.push(pathname)
            }
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

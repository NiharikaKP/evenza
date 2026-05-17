import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Status = 'live' | 'upcoming' | 'past' | 'cancelled';

const statusConfig: Record<Status, { label: string; className: string }> = {
  live: { label: 'Live', className: 'bg-green-500/15 text-green-700 border-green-500/30 dark:text-green-400' },
  upcoming: { label: 'Upcoming', className: 'bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400' },
  past: { label: 'Past', className: 'bg-muted text-muted-foreground border-border' },
  cancelled: { label: 'Cancelled', className: 'bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-400' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as Status] ?? statusConfig.past;
  return (
    <Badge variant="outline" className={cn('text-xs font-medium', config.className)}>
      {config.label}
    </Badge>
  );
}

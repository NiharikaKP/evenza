'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const QRCode = dynamic(() => import('react-qr-code'), { ssr: false });

type EventInfo = {
  title: string;
  startTime: Date;
  endTime: Date;
  isCancelled: boolean;
};

interface QRTicketProps {
  qrToken: string;
  event: EventInfo;
}

export function QRTicket({ qrToken, event }: QRTicketProps) {
  const now = new Date();
  const isActive =
    !event.isCancelled && now >= event.startTime && now <= event.endTime;

  return (
    <div className={cn('rounded-lg border p-4 flex flex-col items-center gap-3', !isActive && 'opacity-50 grayscale')}>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
            isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      <QRCode value={qrToken} size={180} />
      <div className="text-center space-y-1">
        <p className="text-sm font-medium">{event.title}</p>
        <p className="text-xs text-muted-foreground">
          {event.startTime.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </p>
        <p className="text-xs text-muted-foreground">
          Valid only during event hours. Single use.
        </p>
      </div>
    </div>
  );
}

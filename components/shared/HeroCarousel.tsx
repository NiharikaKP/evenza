'use client';

import Link from 'next/link';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import { useRef } from 'react';
import { getClubColor, isPlaceholderImage } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

type FeaturedEvent = {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  club: { name: string; imageUrl: string | null } | null;
  category: { name: string } | null;
};

export function HeroCarousel({ events }: { events: FeaturedEvent[] }) {
  const plugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: false }));

  if (events.length === 0) {
    return (
      <div className="flex h-72 items-center px-8 md:px-16">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Welcome to EVENZA</h1>
          <p className="text-muted-foreground text-lg">
            Your campus event hub — discover, register, and attend.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Carousel className="w-full" opts={{ loop: true }} plugins={[plugin.current]}>
      <CarouselContent>
        {events.map((event) => (
          <CarouselItem key={event.id}>
            <Link href={`/events/${event.id}`} className="block">
              <div className="relative h-[420px] md:h-[680px] w-full overflow-hidden">
                {/* Background image or gradient */}
                {event.club && !isPlaceholderImage(event.club.imageUrl) ? (
                  <Image
                    src={event.club.imageUrl!}
                    alt={event.title}
                    fill
                    className="object-cover brightness-75"
                    priority
                  />
                ) : (
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${getClubColor(event.club?.name ?? event.title)}`}
                  />
                )}

                {/* Bottom fade into page background */}
                <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-background via-background/70 to-transparent pointer-events-none" />

                {/* Text — bottom left */}
                <div className="absolute bottom-0 left-0 right-0 px-8 md:px-14 pb-6 text-foreground dark:text-white">
                  {(event.club || event.category) && (
                    <p className="text-xs font-black uppercase tracking-[0.2em] mb-3 text-foreground/60 dark:text-white/75">
                      {event.club?.name}
                      {event.club && event.category && ' · '}
                      {event.category?.name}
                    </p>
                  )}
                  <h2 className="text-3xl md:text-5xl font-bold leading-tight max-w-2xl text-foreground dark:text-white drop-shadow-sm">
                    {event.title}
                  </h2>
                  <p className="mt-2 text-sm md:text-base line-clamp-1 max-w-xl text-foreground/60 dark:text-white/70">
                    {event.description}
                  </p>
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious className="left-4 h-8 w-8 opacity-60 hover:opacity-100" />
      <CarouselNext className="right-4 h-8 w-8 opacity-60 hover:opacity-100" />
    </Carousel>
  );
}

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getClubColor, isPlaceholderImage } from '@/lib/utils';

type ClubCardProps = {
  club: {
    id: string;
    name: string;
    imageUrl: string | null;
    category: { name: string } | null;
  };
};

export function ClubCard({ club }: ClubCardProps) {
  return (
    <Link href={`/events?club=${club.id}`} className="group block h-full">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative h-32 w-full overflow-hidden rounded-t-lg">
          {!isPlaceholderImage(club.imageUrl) ? (
            <Image
              src={club.imageUrl!}
              alt={club.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div
              className={`flex h-full items-center justify-center bg-gradient-to-br ${getClubColor(club.name)} transition-transform group-hover:scale-105`}
            >
              <span className="text-4xl font-bold text-white/90 select-none">
                {club.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <CardContent className="p-4 space-y-1.5">
          <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors">
            {club.name}
          </h3>
          {club.category && (
            <Badge variant="secondary" className="text-xs">
              {club.category.name}
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

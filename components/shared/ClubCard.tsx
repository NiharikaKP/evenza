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
    description: string | null;
    category: { name: string } | null;
  };
};

export function ClubCard({ club }: ClubCardProps) {
  return (
    <Link href={`/clubs/${club.id}`} className="group block">
      <div className="pt-10 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 h-20 w-20 rounded-full overflow-hidden ring-4 ring-background shadow-md">
          {!isPlaceholderImage(club.imageUrl) ? (
            <Image
              src={club.imageUrl!}
              alt={club.name}
              fill
              className="object-cover"
            />
          ) : (
            <div
              className={`flex h-full items-center justify-center bg-gradient-to-br ${getClubColor(club.name)}`}
            >
              <span className="text-2xl font-bold text-white/90 select-none">
                {club.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <Card className="overflow-hidden transition-shadow hover:shadow-md group-hover:shadow-md">
          <CardContent className="pt-12 pb-4 px-4 text-center space-y-1.5">
            <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors">
              {club.name}
            </h3>
            {club.category && (
              <Badge variant="secondary" className="text-xs">
                {club.category.name}
              </Badge>
            )}
            {club.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {club.description}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Link>
  );
}
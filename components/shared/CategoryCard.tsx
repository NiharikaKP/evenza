import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type CategoryCardProps = {
  category: { id: string; name: string };
  highlighted?: boolean;
};

export function CategoryCard({ category, highlighted }: CategoryCardProps) {
  return (
    <Link href={`/events?category=${category.id}`} className="group block h-full">
      <Card
        className={cn(
          'h-full transition-shadow hover:shadow-md cursor-pointer',
          highlighted && 'border-primary bg-primary/5',
        )}
      >
        <CardContent className="flex items-center justify-center p-6">
          <span
            className={cn(
              'font-medium text-center group-hover:text-primary transition-colors',
              highlighted && 'text-primary',
            )}
          >
            {category.name}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

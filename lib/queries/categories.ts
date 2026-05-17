import { cache } from 'react';
import { asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';

export type CategoryRow = Awaited<ReturnType<typeof getCategories>>[number];

export const getCategories = cache(async () => {
  return db.query.categories.findMany({
    orderBy: [asc(categories.name)],
  });
});

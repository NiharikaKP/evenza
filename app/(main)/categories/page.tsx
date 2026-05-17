import type { Metadata } from 'next';
import { getCategories } from '@/lib/queries/categories';
import { CategoryCard } from '@/components/shared/CategoryCard';

export const metadata: Metadata = { title: 'Categories — EVENZA' };

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Categories</h1>
        <p className="text-muted-foreground">
          Browse by interest — click a category to see all matching events.
        </p>
      </div>

      {categories.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No categories have been added yet.</p>
      )}
    </main>
  );
}

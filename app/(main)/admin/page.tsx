import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getAllUsers, getAllEvents } from '@/lib/queries/admin';
import { getClubs } from '@/lib/queries/clubs';
import { getCategories } from '@/lib/queries/categories';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UsersTable } from '@/components/admin/UsersTable';
import { ClubsManager } from '@/components/admin/ClubsManager';
import { CategoriesManager } from '@/components/admin/CategoriesManager';
import { FeaturedEventsManager } from '@/components/admin/FeaturedEventsManager';

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }

  const [allUsers, allClubs, allCategories, allEvents] = await Promise.all([
    getAllUsers(),
    getClubs(),
    getCategories(),
    getAllEvents(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground mt-1">Manage users, clubs, categories, and featured events</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="clubs">Clubs</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="featured">Featured Events</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UsersTable users={allUsers} allClubs={allClubs} currentAdminId={session.user.id} />
        </TabsContent>

        <TabsContent value="clubs" className="mt-6">
          <ClubsManager clubs={allClubs} categories={allCategories} />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <CategoriesManager categories={allCategories} />
        </TabsContent>

        <TabsContent value="featured" className="mt-6">
          <FeaturedEventsManager events={allEvents} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

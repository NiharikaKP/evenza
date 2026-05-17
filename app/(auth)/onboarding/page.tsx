import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { OnboardingForm } from '@/components/onboarding/OnboardingForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect('/sign-in');
  if (session.user.onboardingComplete) redirect('/');

  const allCategories = await db.select({ id: categories.id, name: categories.name }).from(categories);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Complete your profile</CardTitle>
          <CardDescription>
            Tell us a bit about yourself before you start exploring events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingForm categories={allCategories} />
        </CardContent>
      </Card>
    </div>
  );
}

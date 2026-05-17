import { neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import * as schema from './schema';
import { auth } from '../auth';

// Bun has a native WebSocket global — no ws package needed
neonConfig.webSocketConstructor = WebSocket;

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema });

async function seed() {
  console.log('Seeding database...');

  // Categories
  const categoryNames = ['Tech', 'Cultural', 'Sports', 'Literary', 'Music', 'Workshop'];
  const insertedCategories = await db
    .insert(schema.categories)
    .values(categoryNames.map((name) => ({ name })))
    .returning();

  const categoryMap = Object.fromEntries(insertedCategories.map((c) => [c.name, c.id]));
  console.log('✓ Categories seeded');

  // Clubs
  const insertedClubs = await db
    .insert(schema.clubs)
    .values([
      { name: 'CodeCraft', categoryId: categoryMap['Tech'] },
      { name: 'Spandan', categoryId: categoryMap['Cultural'] },
      { name: 'Strikers FC', categoryId: categoryMap['Sports'] },
      { name: 'Wordsmiths', categoryId: categoryMap['Literary'] },
    ])
    .returning();

  const clubMap = Object.fromEntries(insertedClubs.map((c) => [c.name, c.id]));
  console.log('✓ Clubs seeded');

  const now = new Date();

  // Users — created via Better Auth so passwords are properly hashed in the
  // accounts table and the users can actually log in.
  const seedUsers = [
    { name: 'Admin', email: 'admin@evenza.com', password: 'Admin@123', role: 'admin' as const },
    { name: 'Test Organizer', email: 'organizer@evenza.com', password: 'Organizer@123', role: 'organizer' as const },
    { name: 'Test Student', email: 'student@evenza.com', password: 'Student@123', role: 'student' as const },
  ];

  for (const u of seedUsers) {
    await auth.api.signUpEmail({ body: { name: u.name, email: u.email, password: u.password } });
    await db
      .update(schema.users)
      .set({ role: u.role, onboardingComplete: true, emailVerified: true })
      .where(eq(schema.users.email, u.email));
  }

  const allSeededUsers = await db.select().from(schema.users);
  const userMap = Object.fromEntries(
    allSeededUsers
      .filter((u) => seedUsers.some((s) => s.email === u.email))
      .map((u) => [u.email, u.id]),
  );
  const organizerId = userMap['organizer@evenza.com'];
  console.log('✓ Users seeded (with loginable accounts)');

  // OrganizerClubs
  await db.insert(schema.organizerClubs).values([
    { organizerId, clubId: clubMap['CodeCraft'] },
    { organizerId, clubId: clubMap['Spandan'] },
  ]);
  console.log('✓ OrganizerClubs seeded');

  // Events
  const upcoming = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const upcomingEnd = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
  const liveStart = new Date(now.getTime() - 1 * 60 * 60 * 1000);
  const liveEnd = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const pastStart = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
  const pastEnd = new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000);

  await db.insert(schema.events).values([
    {
      title: 'Next.js Workshop',
      description: 'A hands-on workshop on building modern web apps with Next.js.',
      venue: 'CS Lab 1',
      categoryId: categoryMap['Tech'],
      clubId: clubMap['CodeCraft'],
      organizerId,
      startTime: upcoming,
      endTime: upcomingEnd,
      totalSeats: 50,
      customFields: [{ label: 'Laptop brand', required: false }],
    },
    {
      title: 'Spandan Annual Fest',
      description: 'The biggest cultural fest of the year with performances and competitions.',
      venue: 'Main Auditorium',
      categoryId: categoryMap['Cultural'],
      clubId: clubMap['Spandan'],
      organizerId,
      startTime: liveStart,
      endTime: liveEnd,
      totalSeats: 200,
      customFields: [],
      isFeatured: true,
    },
    {
      title: 'Code Hackathon 2025',
      description: '24-hour hackathon focused on solving real-world problems with code.',
      venue: 'Innovation Hub',
      categoryId: categoryMap['Tech'],
      clubId: clubMap['CodeCraft'],
      organizerId,
      startTime: pastStart,
      endTime: pastEnd,
      totalSeats: 100,
      customFields: [],
    },
  ]);
  console.log('✓ Events seeded');

  console.log('\nSeed complete! Summary:');
  console.log(`  - ${insertedCategories.length} categories`);
  console.log(`  - ${insertedClubs.length} clubs`);
  console.log(`  - ${seedUsers.length} users`);
  console.log('  - 3 events (1 upcoming, 1 live, 1 past)');
  console.log('\nTest credentials:');
  console.log('  admin@evenza.com     / Admin@123');
  console.log('  organizer@evenza.com / Organizer@123');
  console.log('  student@evenza.com   / Student@123');

  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  pool.end().finally(() => process.exit(1));
});
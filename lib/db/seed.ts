import { neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

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

  // Users (passwords managed by Better Auth in Phase 2)
  const now = new Date();

  const insertedUsers = await db
    .insert(schema.users)
    .values([
      {
        id: crypto.randomUUID(),
        name: 'Admin',
        email: 'admin@evenza.com',
        emailVerified: true,
        role: 'admin',
        onboardingComplete: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: crypto.randomUUID(),
        name: 'Test Organizer',
        email: 'organizer@evenza.com',
        emailVerified: true,
        role: 'organizer',
        onboardingComplete: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: crypto.randomUUID(),
        name: 'Test Student',
        email: 'student@evenza.com',
        emailVerified: true,
        role: 'student',
        onboardingComplete: true,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .returning();

  const userMap = Object.fromEntries(insertedUsers.map((u) => [u.email, u.id]));
  const organizerId = userMap['organizer@evenza.com'];
  console.log('✓ Users seeded');

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
  console.log(`  - ${insertedUsers.length} users`);
  console.log('  - 3 events (1 upcoming, 1 live, 1 past)');

  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  pool.end().finally(() => process.exit(1));
});

/**
 * Re-seeds the 3 base users using Better Auth's server API so passwords are
 * properly hashed. Run AFTER the initial seed has already populated categories,
 * clubs, and events, OR run standalone on a clean DB.
 *
 * Usage: bun run lib/db/seed-auth.ts
 */

import { neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import * as schema from './schema';
import * as authSchema from './schema-auth';
import { auth } from '../auth';

neonConfig.webSocketConstructor = WebSocket;

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema: { ...schema, ...authSchema } });

const SEED_USERS = [
  { email: 'admin@evenza.com', password: 'password123', name: 'Admin', role: 'admin' as const },
  {
    email: 'organizer@evenza.com',
    password: 'password123',
    name: 'Test Organizer',
    role: 'organizer' as const,
  },
  {
    email: 'student@evenza.com',
    password: 'password123',
    name: 'Test Student',
    role: 'student' as const,
  },
];

async function reseedUsers() {
  console.log('Re-seeding users with Better Auth password hashing...\n');

  for (const u of SEED_USERS) {
    // Check if the user already has an account record
    const existing = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, u.email))
      .limit(1);

    if (existing.length > 0) {
      const userId = existing[0].id;

      // Delete any stale account entry so we can recreate it cleanly
      await db
        .delete(authSchema.accounts)
        .where(eq(authSchema.accounts.userId, userId));

      // Use Better Auth's internal password hasher via ctx
      const ctx = await auth.$context;
      const hashed = await ctx.password.hash(u.password);
      const now = new Date();

      await db.insert(authSchema.accounts).values({
        id: crypto.randomUUID(),
        accountId: userId,
        providerId: 'credential',
        userId,
        password: hashed,
        createdAt: now,
        updatedAt: now,
      });

      // Ensure role and onboardingComplete are correct
      await db
        .update(schema.users)
        .set({ role: u.role, onboardingComplete: true, updatedAt: now })
        .where(eq(schema.users.id, userId));

      console.log(`✓ ${u.email} — account created, role=${u.role}`);
    } else {
      // User doesn't exist yet — create via Better Auth API
      const res = await auth.api.signUpEmail({
        body: { email: u.email, password: u.password, name: u.name },
      });

      if (!res?.user?.id) {
        console.error(`✗ Failed to create ${u.email}`);
        continue;
      }

      const now = new Date();
      await db
        .update(schema.users)
        .set({ role: u.role, onboardingComplete: true, updatedAt: now })
        .where(eq(schema.users.id, res.user.id));

      console.log(`✓ ${u.email} — new user created, role=${u.role}`);
    }
  }

  console.log('\nDone. All seed users can now sign in with password: password123');
  await pool.end();
}

reseedUsers().catch((err) => {
  console.error('Re-seed failed:', err);
  pool.end().finally(() => process.exit(1));
});

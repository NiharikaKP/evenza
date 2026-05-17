import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import * as authSchema from '@/lib/db/schema-auth';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { ...schema, ...authSchema },
    usePlural: true,
  }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      role: { type: 'string', defaultValue: 'student' },
      rollNumber: { type: 'string', required: false },
      department: { type: 'string', required: false },
      year: { type: 'string', required: false },
      interests: { type: 'string[]', required: false },
      onboardingComplete: { type: 'boolean', defaultValue: false },
    },
  },
});

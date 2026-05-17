import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  role: text('role', { enum: ['student', 'organizer', 'admin'] }).notNull().default('student'),
  rollNumber: text('roll_number'),
  department: text('department'),
  year: text('year'),
  interests: jsonb('interests').$type<string[]>().default([]),
  onboardingComplete: boolean('onboarding_complete').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const categories = pgTable('categories', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const clubs = pgTable('clubs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
  categoryId: text('category_id').references(() => categories.id),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const organizerClubs = pgTable(
  'organizer_clubs',
  {
    organizerId: text('organizer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    clubId: text('club_id')
      .notNull()
      .references(() => clubs.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.organizerId, t.clubId] })],
);

export const events = pgTable('events', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  description: text('description').notNull(),
  venue: text('venue').notNull(),
  categoryId: text('category_id').notNull().references(() => categories.id),
  clubId: text('club_id').notNull().references(() => clubs.id),
  organizerId: text('organizer_id').notNull().references(() => users.id),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  totalSeats: integer('total_seats').notNull(),
  googleDriveUrl: text('google_drive_url'),
  imageUrl: text('image_url'),
  customFields: jsonb('custom_fields')
    .$type<{ label: string; required: boolean }[]>()
    .default([]),
  isFeatured: boolean('is_featured').notNull().default(false),
  isCancelled: boolean('is_cancelled').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const registrations = pgTable(
  'registrations',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    eventId: text('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    qrToken: text('qr_token')
      .notNull()
      .unique()
      .$defaultFn(() => crypto.randomUUID()),
    customResponses: jsonb('custom_responses')
      .$type<{ label: string; value: string }[]>()
      .default([]),
    attended: boolean('attended').notNull().default(false),
    scanned: boolean('scanned').notNull().default(false),
    registeredAt: timestamp('registered_at').notNull().defaultNow(),
  },
  (t) => [unique().on(t.eventId, t.userId)],
);

// --- Relations ---

export const categoriesRelations = relations(categories, ({ many }) => ({
  clubs: many(clubs),
  events: many(events),
}));

export const clubsRelations = relations(clubs, ({ one, many }) => ({
  category: one(categories, { fields: [clubs.categoryId], references: [categories.id] }),
  events: many(events),
  organizerClubs: many(organizerClubs),
}));

export const organizerClubsRelations = relations(organizerClubs, ({ one }) => ({
  organizer: one(users, { fields: [organizerClubs.organizerId], references: [users.id] }),
  club: one(clubs, { fields: [organizerClubs.clubId], references: [clubs.id] }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  club: one(clubs, { fields: [events.clubId], references: [clubs.id] }),
  category: one(categories, { fields: [events.categoryId], references: [categories.id] }),
  organizer: one(users, { fields: [events.organizerId], references: [users.id] }),
  registrations: many(registrations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  registrations: many(registrations),
  organizerClubs: many(organizerClubs),
}));

export const registrationsRelations = relations(registrations, ({ one }) => ({
  event: one(events, { fields: [registrations.eventId], references: [events.id] }),
  user: one(users, { fields: [registrations.userId], references: [users.id] }),
}));

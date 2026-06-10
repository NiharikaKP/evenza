# Evenza — Campus Event Management Platform

A full-stack platform built for university environments. Students browse and register for events, organizers manage events and scan QR codes for attendance, and admins control clubs, categories, and user roles.

**Built with:** Next.js 16 · Drizzle ORM · Neon PostgreSQL · Better Auth

---

## Features

**For Students**
- Browse events by category, club, or status (live / upcoming / past)
- Register for events with custom form fields (e.g. T-shirt size, dietary preference)
- Get a unique QR code ticket per registration — visible only during the event window
- Manage profile: roll number, department, year, interest categories

**For Organizers**
- Create and manage events with seat limits, custom fields, and banner images
- View real-time attendee list with registration responses
- Scan QR codes for attendance — race-condition safe (two simultaneous scans cannot both succeed)
- Cancel events with soft-delete (history preserved)

**For Admins**
- Full user management: promote / demote roles (student → organizer → admin)
- CRUD for clubs and categories with logo uploads
- Assign clubs to organizers
- Toggle featured events shown in the home page hero carousel

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server Components + Server Actions — no separate backend needed |
| UI | shadcn/ui + Tailwind CSS v4 | Copy-owned components, fully customizable |
| Auth | Better Auth | Email/password auth with custom user fields (role, department, year) |
| ORM | Drizzle ORM | Type-safe SQL with schema-as-code; works great with serverless DBs |
| Database | Neon (PostgreSQL) | Serverless Postgres — scales to zero, HTTP connection |
| Storage | Vercel Blob | Object storage for club and event images |
| QR Display | react-qr-code | Client-side SVG QR generation from UUID token |
| QR Scanning | html5-qrcode | Camera-based scanner for the organizer attendance page |
| Deployment | Vercel | Zero-config Next.js deployment |

---

## Architecture

```
Browser
  │
  ├── React Server Components        ← reads data directly from DB (no API layer)
  │     └── lib/queries/*.ts         ← Drizzle queries, wrapped in React.cache()
  │
  ├── Server Actions                 ← mutations from form submissions / button clicks
  │     └── actions/*.ts             ← session-checked, validated, revalidates cache
  │
  └── Route Handlers (API)           ← only for operations needing a standard HTTP interface
        └── app/api/
              ├── auth/[...all]/     ← Better Auth catch-all
              ├── scan/[eventId]/    ← QR attendance endpoint (POST)
              └── upload/            ← Vercel Blob image upload (POST)
```

> Most mutations use Server Actions — Next.js App Router handles these without a separate Express/REST layer. Route handlers exist only for QR scanning and image uploads, which need a standard HTTP interface.

---

## Project Structure

```
evenza/
├── app/
│   ├── (auth)/                  # Sign-up, sign-in, onboarding
│   ├── (main)/                  # Main app with shared layout
│   │   ├── page.tsx             # Home — featured + live + upcoming events
│   │   ├── events/
│   │   ├── clubs/
│   │   ├── categories/
│   │   ├── profile/
│   │   ├── organizer/           # Organizer dashboard + event management + QR scanner
│   │   └── admin/               # Admin panel (users, clubs, categories, featured events)
│   └── api/
│       ├── auth/[...all]/
│       ├── scan/[eventId]/
│       └── upload/
│
├── actions/                     # Server Actions (mutations)
│   ├── registrations.ts
│   ├── profile.ts
│   ├── organizer.ts
│   └── admin.ts
│
├── lib/
│   ├── auth.ts                  # Better Auth server instance
│   ├── auth-client.ts           # Better Auth client hooks
│   ├── db/
│   │   ├── index.ts             # Drizzle + Neon HTTP connection
│   │   ├── schema.ts            # All table definitions
│   │   ├── schema-auth.ts       # Better Auth generated tables
│   │   └── seed.ts              # Database seed script
│   └── queries/                 # Read-only data fetching (React.cache)
│       ├── events.ts
│       ├── organizer.ts
│       ├── admin.ts
│       ├── categories.ts
│       ├── clubs.ts
│       └── registrations.ts
│
├── components/                  # Reusable UI components
├── drizzle.config.ts
└── middleware.ts
```

---

## Getting Started

### Prerequisites

- Node.js 20+ or Bun
- A [Neon](https://neon.tech) database (free tier works)
- A [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) store (optional for local dev)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/evenza.git
cd evenza

# 2. Install dependencies
bun install

# 3. Set up environment variables
cp .env.example .env.local
```

Fill in `.env.local`:

```env
DATABASE_URL=postgresql://...          # Neon connection string
BETTER_AUTH_SECRET=...                 # Random secret string
NEXT_PUBLIC_APP_URL=http://localhost:3000
BLOB_READ_WRITE_TOKEN=...              # Vercel Blob token (optional)
```

```bash
# 4. Push schema to your database
bun run db:migrate

# 5. Seed with sample data
bun run db:seed

# 6. Start the dev server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start dev server with Turbopack |
| `bun run build` | Production build |
| `bun run db:studio` | Open Drizzle Studio (visual database browser) |
| `bun run db:generate` | Generate migration files after schema changes |
| `bun run db:migrate` | Apply pending migrations |
| `bun run db:seed` | Seed the database with sample data |
| `bun run typecheck` | TypeScript compiler check |
| `bun run lint` | ESLint |
| `bun run format` | Format with Prettier |

---

## Database Schema

### User roles

| Role | How assigned | Access |
|---|---|---|
| `student` | Default on sign-up | Browse events, register, view QR ticket |
| `organizer` | Admin promotes | All student features + create events, scan QR |
| `admin` | Seeded directly in DB | All features + manage users, clubs, categories |

### Key tables

- `users` — stores role, rollNumber, department, year, interests (JSONB), onboardingComplete
- `events` — title, venue, times, seats, customFields (JSONB), isFeatured, isCancelled
- `registrations` — qrToken (UUID), customResponses (JSONB), attended, scanned
- `organizerClubs` — many-to-many join: which clubs an organizer can create events for
- `categories` / `clubs` — hierarchical: every club belongs to a category

---

## Notable Implementation Details

**Race-condition safe QR scanning**

Two organizers scanning the same QR code simultaneously cannot both mark a student as attended. The scan endpoint uses a conditional SQL update:

```ts
const updated = await db
  .update(registrations)
  .set({ attended: true, scanned: true })
  .where(and(
    eq(registrations.id, registration.id),
    eq(registrations.scanned, false),   // only updates if not already scanned
  ))
  .returning({ id: registrations.id });

if (updated.length === 0) {
  return NextResponse.json({ success: false, error: 'already_scanned' });
}
```

**Event status is computed, not stored**

`live`, `upcoming`, `past`, and `cancelled` are derived from timestamps at query time — not stored as a column. This avoids stale status data and simplifies updates.

**No separate backend**

Next.js Server Components fetch data directly via Drizzle. Server Actions handle all mutations. The only traditional HTTP endpoints are for QR scanning and image uploads — operations that genuinely need a standard HTTP interface.

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Yes | Secret for session signing (min 32 chars) |
| `NEXT_PUBLIC_APP_URL` | Yes | App base URL (used by Better Auth) |
| `BLOB_READ_WRITE_TOKEN` | No | Vercel Blob token for image uploads |

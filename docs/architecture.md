# EVENZA — System Architecture

**Version:** 1.0  
**Date:** 2026-05-17

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Database Architecture](#database-architecture)
4. [Authentication Architecture](#authentication-architecture)
5. [Data Fetching Architecture](#data-fetching-architecture)
6. [Component Architecture](#component-architecture)
7. [Server Actions](#server-actions)
8. [API Route Handlers](#api-route-handlers)
9. [UI Architecture (Shadcn)](#ui-architecture-shadcn)
10. [Performance Practices](#performance-practices)
11. [Key Feature Implementations](#key-feature-implementations)
12. [Environment Variables](#environment-variables)
13. [Deployment](#deployment)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, React Server Components) |
| UI | Shadcn UI — preset `b88r6lY52I` |
| Auth | Better Auth (email/password, Drizzle adapter) |
| ORM | Drizzle ORM |
| Database | Neon (Postgres) — Vercel integration |
| Storage | Vercel Blob (club logos) |
| QR Display | `react-qr-code` |
| QR Scanning | `html5-qrcode` |
| Deployment | Vercel |

---

## Project Structure

```
evenza/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (fonts, providers)
│   ├── page.tsx                  # Home / landing page (RSC)
│   ├── (auth)/                   # Route group — no shared layout
│   │   ├── sign-in/page.tsx
│   │   ├── sign-up/page.tsx
│   │   └── onboarding/page.tsx   # Post-signup onboarding step
│   ├── events/
│   │   ├── page.tsx              # Events directory (RSC)
│   │   └── [id]/page.tsx         # Event detail (RSC)
│   ├── clubs/page.tsx            # Clubs directory (RSC)
│   ├── categories/page.tsx       # Categories directory (RSC)
│   ├── profile/page.tsx          # Profile + My Events (RSC shell)
│   ├── organizer/
│   │   ├── page.tsx              # Organizer dashboard (RSC)
│   │   └── events/[id]/
│   │       └── scan/page.tsx     # QR scanner — Client Component
│   ├── admin/page.tsx            # Admin panel (RSC)
│   ├── api/
│   │   ├── auth/[...all]/route.ts  # Better Auth catch-all handler
│   │   ├── events/
│   │   │   └── [id]/
│   │   │       ├── register/route.ts
│   │   │       └── unregister/route.ts
│   │   ├── scan/[eventId]/route.ts
│   │   └── upload/route.ts        # Vercel Blob upload endpoint
│   └── error.tsx / not-found.tsx
├── components/
│   ├── ui/                       # Shadcn auto-generated components (never edit manually)
│   ├── events/                   # Event-specific components
│   ├── organizer/                # Organizer dashboard components
│   ├── admin/                    # Admin page components
│   └── shared/                  # Reusable across pages
├── lib/
│   ├── auth.ts                   # Better Auth server instance
│   ├── auth-client.ts            # Better Auth client instance
│   ├── db/
│   │   ├── index.ts              # Drizzle db instance (HTTP adapter)
│   │   └── schema.ts             # All table definitions
│   └── utils.ts                  # cn() and other utilities
├── actions/                      # Server Actions (one file per domain)
│   ├── events.ts
│   ├── registrations.ts
│   ├── profile.ts
│   ├── organizer.ts
│   └── admin.ts
├── middleware.ts                 # Auth + onboarding redirect middleware
├── drizzle.config.ts
└── .env.local
```

### File Convention Rules (Next.js 16)

- `page.tsx` — public UI for a route segment
- `layout.tsx` — shared UI that persists across child routes
- `loading.tsx` — Suspense fallback shown during RSC streaming
- `error.tsx` — error boundary (must be a Client Component)
- `not-found.tsx` — 404 UI for that segment
- Route groups `(name)/` — grouping without affecting URL path
- Never create a `route.ts` and `page.tsx` in the same directory — they conflict

---

## Database Architecture

### Adapter Choice

EVENZA deploys to **Vercel** (serverless). Use the **HTTP adapter** from `@neondatabase/serverless`:

```ts
// lib/db/index.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

Never use the WebSocket adapter in a serverless/Vercel environment — it requires persistent connections that don't exist in serverless functions.

### Schema

```ts
// lib/db/schema.ts

// --- Users ---
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
  interests: jsonb('interests').$type<string[]>().default([]), // array of category IDs
  onboardingComplete: boolean('onboarding_complete').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Better Auth also creates: sessions, accounts, verifications tables (via CLI generate)

// --- Categories ---
export const categories = pgTable('categories', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// --- Clubs ---
export const clubs = pgTable('clubs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
  categoryId: text('category_id').references(() => categories.id),
  imageUrl: text('image_url'),  // Vercel Blob URL
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// --- Organizer ↔ Club (many-to-many) ---
export const organizerClubs = pgTable('organizer_clubs', {
  organizerId: text('organizer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  clubId: text('club_id').notNull().references(() => clubs.id, { onDelete: 'cascade' }),
}, (t) => [primaryKey({ columns: [t.organizerId, t.clubId] })]);

// --- Events ---
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
  customFields: jsonb('custom_fields').$type<{ label: string; required: boolean }[]>().default([]),
  isFeatured: boolean('is_featured').notNull().default(false),
  isCancelled: boolean('is_cancelled').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// --- Registrations ---
export const registrations = pgTable('registrations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  eventId: text('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  qrToken: text('qr_token').notNull().unique().$defaultFn(() => crypto.randomUUID()),
  customResponses: jsonb('custom_responses').$type<{ label: string; value: string }[]>().default([]),
  attended: boolean('attended').notNull().default(false),
  scanned: boolean('scanned').notNull().default(false),
  registeredAt: timestamp('registered_at').notNull().defaultNow(),
}, (t) => [unique().on(t.eventId, t.userId)]);
```

### Event Status — Never Stored, Always Computed

```ts
// lib/utils.ts
export function getEventStatus(event: { startTime: Date; endTime: Date; isCancelled: boolean }) {
  if (event.isCancelled) return 'cancelled';
  const now = new Date();
  if (now < event.startTime) return 'upcoming';
  if (now >= event.startTime && now <= event.endTime) return 'live';
  return 'past';
}
```

Status is NEVER stored in the database. It is derived at runtime from `startTime`, `endTime`, and `isCancelled`. This prevents stale status bugs.

### Migrations

```bash
# Generate schema for Better Auth tables
npx @better-auth/cli@latest generate --output lib/db/schema-auth.ts

# Generate and run Drizzle migrations
npx drizzle-kit generate
npx drizzle-kit migrate
```

---

## Authentication Architecture

### Better Auth Setup

```ts
// lib/auth.ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema }),
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
```

```ts
// lib/auth-client.ts
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

```ts
// app/api/auth/[...all]/route.ts
import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST } = toNextJsHandler(auth);
```

### Roles

| Role | Access |
|------|--------|
| `student` | All public pages, registration, profile |
| `organizer` | All student access + `/organizer/*` |
| `admin` | All access + `/admin` |

### Middleware — Auth + Onboarding Guard

```ts
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

const PUBLIC_ROUTES = ['/', '/events', '/clubs', '/categories', '/sign-in', '/sign-up'];
const ONBOARDING_ROUTE = '/onboarding';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionCookie(request);

  // Allow public routes for everyone
  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) return NextResponse.next();

  // Unauthenticated — redirect to sign-in
  if (!session) return NextResponse.redirect(new URL('/sign-in', request.url));

  // Authenticated but onboarding incomplete — redirect to onboarding
  // (except when already on the onboarding route)
  if (!session.user.onboardingComplete && pathname !== ONBOARDING_ROUTE) {
    return NextResponse.redirect(new URL(ONBOARDING_ROUTE, request.url));
  }

  // Organizer-only routes
  if (pathname.startsWith('/organizer') && !['organizer', 'admin'].includes(session.user.role)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Admin-only routes
  if (pathname.startsWith('/admin') && session.user.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### Session Access in Server Components

```ts
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// In any RSC or Server Action:
const session = await auth.api.getSession({ headers: await headers() });
```

---

## Data Fetching Architecture

### Core Principle: Fetch in RSC, Pass Down as Props

Fetch all data in Server Components (RSC). Never fetch in Client Components unless truly necessary (e.g., real-time, user interactions). This eliminates client-server waterfalls.

### Pattern: Parallel Data Fetching in RSC

```ts
// app/events/[id]/page.tsx (RSC)
export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // params is now a Promise in Next.js 16
  const session = await auth.api.getSession({ headers: await headers() });

  // Fetch in parallel — never await sequentially
  const [event, registration, relatedEvents] = await Promise.all([
    getEvent(id),
    session ? getRegistration(id, session.user.id) : null,
    getRelatedEvents(id),
  ]);

  if (!event) notFound();

  return <EventDetail event={event} registration={registration} relatedEvents={relatedEvents} />;
}
```

### Request Deduplication with `React.cache()`

Use `React.cache()` to deduplicate identical DB calls within a single request (e.g., session fetched in both layout and page):

```ts
// lib/queries.ts
import { cache } from 'react';
import { db } from '@/lib/db';

export const getEvent = cache(async (id: string) => {
  return db.query.events.findFirst({ where: eq(events.id, id), with: { club: true, category: true } });
});
```

### Search Params Are Async in Next.js 16

```ts
// app/events/page.tsx
export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; category?: string; club?: string; page?: string }>
}) {
  const { q, status, category, club, page } = await searchParams; // must await
  const events = await getEvents({ q, status, category, club, page: Number(page) || 1 });
  return <EventsGrid events={events} />;
}
```

### Suspense Boundaries for Streaming

Wrap slow data-fetching sections in `<Suspense>` to stream the page shell immediately:

```tsx
// app/page.tsx (Home)
import { Suspense } from 'react';

export default function HomePage() {
  return (
    <>
      <HeroSlideshow />  {/* small, fast — no suspense needed */}
      <Suspense fallback={<CategoryGridSkeleton />}>
        <CategoryGrid />
      </Suspense>
      <Suspense fallback={<EventsSkeleton />}>
        <LiveEventsSection />
      </Suspense>
      <Suspense fallback={<EventsSkeleton />}>
        <UpcomingEventsSection />
      </Suspense>
    </>
  );
}
```

---

## Component Architecture

### RSC vs Client Component Decision Rule

Default to **Server Components**. Add `'use client'` only when the component:
- Uses React hooks (`useState`, `useEffect`, `useRef`, etc.)
- Needs browser-only APIs (`window`, `navigator.mediaDevices` for camera)
- Needs event handlers that require interactivity (`onClick` with local state)
- Uses Better Auth client hooks (`useSession`)

### Boundary Placement

Keep the Client/Server boundary as **deep** as possible:

```
app/events/[id]/page.tsx          ← RSC (fetches data)
  └── EventDetail.tsx             ← RSC (receives data as props)
        ├── EventInfo.tsx         ← RSC (pure display)
        ├── CapacityBar.tsx       ← RSC (pure display)
        └── RegisterButton.tsx   ← 'use client' (needs onClick + state)
```

Do NOT make `EventDetail` a Client Component just because `RegisterButton` needs it — push the boundary down.

### Non-Serializable Props Rule

Never pass non-serializable values across the RSC/Client boundary:
- No functions as props (except Server Actions, which are serializable)
- No class instances, Dates (pass as ISO strings), Maps, Sets

### `'use server'` Directive

Apply `'use server'` at the **function level** inside action files, not at the top of a file (unless the entire file is actions):

```ts
// actions/registrations.ts
'use server'; // top-of-file is fine here — all exports are Server Actions

export async function registerForEvent(eventId: string, responses: CustomResponse[]) { ... }
export async function unregisterFromEvent(eventId: string) { ... }
```

---

## Server Actions

All mutations go through **Server Actions** — no client-side fetch calls to `/api` for mutations. Route handlers are reserved for third-party webhooks, Better Auth, and the QR scan endpoint (called from a mobile camera scanner context).

### Server Action Pattern

```ts
// actions/registrations.ts
'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function registerForEvent(eventId: string, responses: { label: string; value: string }[]) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  // 1. Check event exists and is not cancelled/past
  // 2. Check seat availability (count registrations)
  // 3. Check no duplicate registration
  // 4. Insert registration with UUID qr_token
  // 5. Revalidate relevant paths
  revalidatePath(`/events/${eventId}`);
  revalidatePath('/profile');
}
```

### Calling Server Actions from Client Components

```tsx
// components/events/RegisterButton.tsx
'use client';

import { registerForEvent } from '@/actions/registrations';
import { useTransition } from 'react';

export function RegisterButton({ eventId, customFields }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleRegister() {
    startTransition(async () => {
      await registerForEvent(eventId, []);
    });
  }

  return <Button onClick={handleRegister} disabled={isPending}>Register</Button>;
}
```

Use `useTransition` — not `useState` loading booleans — for Server Action pending states.

---

## API Route Handlers

Route handlers are used only for:

1. **Better Auth** — `app/api/auth/[...all]/route.ts`
2. **QR Scan validation** — `app/api/scan/[eventId]/route.ts` (called from the scanner page)
3. **Vercel Blob upload** — `app/api/upload/route.ts`

### QR Scan Endpoint

```ts
// app/api/scan/[eventId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !['organizer', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { eventId } = await params;
  const { token } = await req.json();

  // 1. Find registration by qr_token
  // 2. Verify registration.eventId === eventId
  // 3. Verify current time is within event.startTime and event.endTime
  // 4. Verify registration.scanned === false
  // 5. Update: attended = true, scanned = true
  // Return: { success: true, attendeeName }
}
```

### Route Handler Rules

- Never create `route.ts` and `page.tsx` in the same directory
- Set appropriate cache headers — route handlers are not cached by default in Next.js 16
- Always validate auth before any DB operation

---

## UI Architecture (Shadcn)

### Preset

This project uses Shadcn preset `b88r6lY52I`. All components are installed via:

```bash
npx shadcn@latest init --preset b88r6lY52I
```

Never modify files in `components/ui/` directly — they are regenerated by the CLI.

### Core Rules

**Use semantic color tokens — never raw Tailwind colors:**
```tsx
// ❌ Wrong
<p className="text-blue-500 bg-gray-100">

// ✅ Correct
<p className="text-primary bg-muted">
```

**`className` is for layout only — never override component colors or typography via className:**
```tsx
// ❌ Wrong — overriding component internals
<Button className="bg-green-500 text-white">

// ✅ Correct — use variants
<Button variant="default">
```

**Compose, don't build from scratch.** Search before writing custom UI:
```bash
npx shadcn@latest search "data table"
npx shadcn@latest docs card
```

**Use `asChild` (radix) for trigger composition:**
```tsx
// ✅ Correct
<DialogTrigger asChild>
  <Button>Open</Button>
</DialogTrigger>
```

### Component Map for EVENZA

| UI Need | Shadcn Component |
|---------|-----------------|
| Event cards grid | `Card`, `CardHeader`, `CardContent` |
| Registration modal | `Dialog`, `DialogContent`, `DialogTrigger` |
| Status filter | `Tabs` or `ToggleGroup` |
| Search bar | `Input` with `Button` |
| Organizer events table | `Table`, `DataTable` |
| Capacity progress | `Progress` |
| Profile tabs | `Tabs`, `TabsContent` |
| Custom field form | `Form`, `FormField`, `Input` |
| Hero slideshow | `Carousel` |
| Category/club grid | `Card` |
| Admin role toggle | `Switch` |
| QR display | Custom + `react-qr-code` |

---

## Performance Practices

### Eliminate Data Waterfalls

Never chain awaits for independent data:

```ts
// ❌ Sequential — slow
const event = await getEvent(id);
const club = await getClub(event.clubId);
const registrations = await getRegistrations(id);

// ✅ Parallel — fast
const [event, registrations] = await Promise.all([getEvent(id), getRegistrations(id)]);
const club = await getClub(event.clubId); // only this depends on event
```

### Bundle Size

- Import from specific paths, not barrel files:
  ```ts
  // ❌
  import { eq, and, or, like, desc } from 'drizzle-orm';  // fine — drizzle is tree-shakeable
  
  // ❌ Avoid barrel imports in your own code
  import { EventCard, EventGrid, EventFilter } from '@/components/events';
  
  // ✅ Direct imports
  import { EventCard } from '@/components/events/EventCard';
  ```

- Use dynamic imports for heavy client-only components:
  ```ts
  // QR scanner is heavy and only used on the scan page
  const QRScanner = dynamic(() => import('@/components/organizer/QRScanner'), { ssr: false });
  
  // react-qr-code only needed client-side
  const QRCode = dynamic(() => import('react-qr-code'), { ssr: false });
  ```

### Image Optimization

Use `next/image` for all images. Club logos from Vercel Blob:

```tsx
import Image from 'next/image';

<Image
  src={club.imageUrl}
  alt={club.name}
  width={80}
  height={80}
  className="rounded-full object-cover"
/>
```

Configure allowed Blob domains in `next.config.ts`:

```ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
  ],
},
```

### Re-render Optimization

- Extract default non-primitive values outside components to avoid re-renders:
  ```ts
  // ❌ New array on every render
  function EventsPage() {
    return <EventFilter defaultCategories={[]} />
  }
  
  // ✅ Stable reference
  const DEFAULT_CATEGORIES: string[] = [];
  function EventsPage() {
    return <EventFilter defaultCategories={DEFAULT_CATEGORIES} />
  }
  ```

- Use functional `setState` for state that depends on previous value:
  ```ts
  // ✅
  setCount(prev => prev + 1);
  ```

- Use `useTransition` for non-urgent updates (filter changes, search) to keep UI responsive.

### Fonts

Load fonts via `next/font` — never via `<link>` tags:

```ts
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap' });
```

---

## Key Feature Implementations

### QR Code Display (Student Ticket)

```tsx
// components/profile/QRTicket.tsx
'use client';

import dynamic from 'next/dynamic';

const QRCode = dynamic(() => import('react-qr-code'), { ssr: false });

export function QRTicket({ token, event }: Props) {
  const now = new Date();
  const isActive = !event.isCancelled && now >= event.startTime && now <= event.endTime;

  return (
    <div className={cn('p-4 rounded-lg border', !isActive && 'opacity-40 grayscale')}>
      <QRCode value={token} size={200} />
      {!isActive && <p className="text-muted-foreground text-sm mt-2">Active only during event</p>}
    </div>
  );
}
```

### QR Scanner (Organizer Attendance)

```tsx
// app/organizer/events/[id]/scan/page.tsx — Server Component shell
// components/organizer/QRScanner.tsx — Client Component

'use client';

import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';

export function QRScanner({ eventId }: { eventId: string }) {
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 }, false);
    scannerRef.current.render(
      async (decodedText) => {
        scannerRef.current?.pause(true);
        const res = await fetch(`/api/scan/${eventId}`, {
          method: 'POST',
          body: JSON.stringify({ token: decodedText }),
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        setResult(data);
        setTimeout(() => { setResult(null); scannerRef.current?.resume(); }, 2500);
      },
      () => {}
    );
    return () => { scannerRef.current?.clear(); };
  }, [eventId]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div id="qr-reader" className="w-full max-w-sm" />
      {result && (
        <div className={cn('mt-4 p-4 rounded-lg text-center text-lg font-semibold',
          result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
          {result.message}
        </div>
      )}
    </div>
  );
}
```

### Event Status Filter (Composable DB Query)

```ts
// lib/queries/events.ts
import { and, eq, gt, lt, lte, gte, or, ilike } from 'drizzle-orm';

export async function getEvents({ q, status, categoryId, clubId, page = 1, pageSize = 12 }) {
  const now = new Date();
  const conditions = [];

  if (q) conditions.push(or(
    ilike(events.title, `%${q}%`),
    ilike(events.description, `%${q}%`),
  ));
  if (categoryId) conditions.push(eq(events.categoryId, categoryId));
  if (clubId) conditions.push(eq(events.clubId, clubId));

  if (status === 'live') {
    conditions.push(lte(events.startTime, now), gte(events.endTime, now), eq(events.isCancelled, false));
  } else if (status === 'upcoming') {
    conditions.push(gt(events.startTime, now), eq(events.isCancelled, false));
  } else if (status === 'past') {
    conditions.push(lt(events.endTime, now), eq(events.isCancelled, false));
  } else if (status === 'cancelled') {
    conditions.push(eq(events.isCancelled, true));
  } else {
    // 'all' — no status filter
  }

  return db.select().from(events)
    .where(and(...conditions))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
    .orderBy(desc(events.startTime));
}
```

### Vercel Blob Upload (Club Logo)

```ts
// app/api/upload/route.ts
import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (session?.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get('file') as File;
  const blob = await put(`clubs/${crypto.randomUUID()}-${file.name}`, file, { access: 'public' });
  return NextResponse.json({ url: blob.url });
}
```

---

## Environment Variables

```env
# .env.local

# Database
DATABASE_URL=postgresql://...  # From Neon / Vercel integration

# Auth
BETTER_AUTH_SECRET=            # openssl rand -base64 32
BETTER_AUTH_URL=               # http://localhost:3000 (dev) / https://yourdomain.com (prod)
NEXT_PUBLIC_APP_URL=           # Same as above (for auth-client.ts)

# Vercel Blob
BLOB_READ_WRITE_TOKEN=         # Auto-set by Vercel Blob integration
```

---

## Deployment

### Vercel Configuration

- **Neon:** Connect via Vercel Storage integration → auto-populates `DATABASE_URL`
- **Vercel Blob:** Enable via Vercel Storage → auto-populates `BLOB_READ_WRITE_TOKEN`
- **Environment variables:** Set `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` in Vercel dashboard

### `next.config.ts`

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
};

export default nextConfig;
```

### Pre-Deployment Checklist

- [ ] Run `npx drizzle-kit migrate` against production Neon DB
- [ ] Set all env vars in Vercel dashboard
- [ ] Seed admin user directly in DB
- [ ] Verify `GET /api/auth/ok` returns `{ status: "ok" }`
- [ ] Test QR scan on a real mobile device (camera access requires HTTPS)

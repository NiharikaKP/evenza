# Phase 3 — Public Pages

## Goal
Build all public-facing read-only pages: the home/landing page, events listing with search/filter/pagination, event detail page, clubs directory, and categories directory. No auth required to view any of these. Data is fetched server-side via RSC.

---

## Context Files
Read all of these before writing a single line of code:
- `@docs/PRD.md`
- `@docs/architecture.md`
- `@lib/db/schema.ts`
- `@lib/db/index.ts`
- `@lib/auth.ts`
- `@lib/auth-client.ts`
- `@middleware.ts`

---

## Prerequisites
- Phase 1 and Phase 2 must be complete
- Seed data is loaded (3 events, 4 clubs, 6 categories in DB)

---

## Task Checklist

### 1. Create Query Layer
- [ ] Create `lib/queries/events.ts`:
  - `getEvents({ q, status, categoryId, clubId, page, pageSize })` — composable filtered query as defined in `docs/architecture.md`. Status filtering uses timestamp comparison, never a stored column.
  - `getEvent(id)` — single event with club and category joined
  - `getFeaturedEvents()` — events where `isFeatured = true` and `isCancelled = false`
  - `getLiveEvents(limit)` — events where now is between startTime and endTime
  - `getUpcomingEvents(limit)` — events where startTime > now, ordered by startTime ASC
- [ ] Create `lib/queries/clubs.ts`:
  - `getClubs()` — all clubs with their category
  - `getClub(id)` — single club
- [ ] Create `lib/queries/categories.ts`:
  - `getCategories()` — all categories
- [ ] Wrap all query functions with `React.cache()` for per-request deduplication

### 2. Home Page (`/`)
- [ ] Create `app/page.tsx` as a Server Component
- [ ] Fetch in parallel with `Promise.all`: featuredEvents, liveEvents (limit 4), upcomingEvents (limit 4), categories, clubs
- [ ] Sections (top to bottom):
  - **Hero Slideshow** — featured events as a Shadcn `Carousel`. Each slide shows event title, club name, date, and a "View Event" button. If no featured events, show a static welcome banner.
  - **Categories Section** — heading "Discover Events You'll Love", grid of category cards. For logged-in users, their interest categories get a visual highlight (different border/background). Use `auth.api.getSession()` to check — if not logged in, show all categories equally.
  - **Live Events Section** — heading "Happening Now", 4 event cards in a grid, "View All" button linking to `/events?status=live`
  - **Upcoming Events Section** — heading "Coming Up", 4 event cards in a grid, "View All" button linking to `/events?status=upcoming`
  - **Clubs Section** — heading "Our Clubs", club cards grid
  - **Footer** — project name, links to Events / Clubs / Categories
- [ ] Create reusable `components/shared/EventCard.tsx` (RSC) — shows: club image, event title, club name, category badge, date/time, venue, seat count remaining
- [ ] Create reusable `components/shared/ClubCard.tsx` (RSC) — shows: club image, name, category
- [ ] Create reusable `components/shared/CategoryCard.tsx` (RSC) — shows: category name
- [ ] Add `loading.tsx` at `app/loading.tsx` for top-level skeleton

### 3. Events Page (`/events`)
- [ ] Create `app/events/page.tsx` as a Server Component
- [ ] Accept `searchParams` as a Promise (Next.js 16) — await it to extract: `q`, `status`, `category`, `club`, `page`
- [ ] Fetch: events (filtered), categories (for filter UI), clubs (for filter UI) in parallel
- [ ] Layout:
  - **Search bar** — text input (Client Component, updates URL search params via `router.push`)
  - **Status filter** — "All / Live / Upcoming / Past / Cancelled" tab-style buttons (Client Component, updates URL)
  - **Category filter** — dropdown or pills (Client Component, updates URL)
  - **Club filter** — dropdown (Client Component, updates URL)
  - **Event cards grid** — 12 per page, 3-4 columns on desktop
  - **Pagination** — prev/next buttons using page param in URL
- [ ] Filters update the URL (not local state) so they are shareable and work on page refresh
- [ ] Create `components/events/EventFilters.tsx` as a Client Component — handles all filter interactions
- [ ] If no events match filters, show an empty state message

### 4. Event Detail Page (`/events/[id]`)
- [ ] Create `app/events/[id]/page.tsx` as a Server Component
- [ ] Await `params` (Next.js 16 — params is a Promise)
- [ ] Fetch event (with club and category), count of current registrations
- [ ] If event not found: call `notFound()`
- [ ] Add `generateMetadata` function for dynamic page title and description
- [ ] Layout:
  - Club image (full-width banner using `next/image`)
  - Category badge, Event title
  - Club name, Organizer info
  - Date/time (start → end), Venue
  - Description
  - **Capacity progress bar** — `registered / totalSeats` using Shadcn `Progress`
  - **Registration button** — for Phase 3, show the button but it does nothing yet (or shows "Sign in to register" if not logged in). The full registration logic comes in Phase 4. Use a placeholder.
  - Google Drive link (if present): "View Resources" external link
- [ ] Add `app/events/[id]/loading.tsx` skeleton

### 5. Clubs Page (`/clubs`)
- [ ] Create `app/clubs/page.tsx` as a Server Component
- [ ] Fetch all clubs with their categories
- [ ] Show club cards grid
- [ ] Each club card links to `/events?club=<clubId>` (takes user to events page filtered for that club)

### 6. Categories Page (`/categories`)
- [ ] Create `app/categories/page.tsx` as a Server Component
- [ ] Fetch all categories
- [ ] Show category cards grid
- [ ] Each category card links to `/events?category=<categoryId>`

### 7. `getEventStatus` Utility
- [ ] Ensure `lib/utils.ts` exports `getEventStatus(event)` (from architecture.md)
- [ ] Use this function everywhere a status label/badge is needed — never compute status inline

### 8. Status Badge Component
- [ ] Create `components/shared/StatusBadge.tsx` — takes a status string, renders a colored Shadcn `Badge`:
  - `live` → green
  - `upcoming` → blue
  - `past` → gray
  - `cancelled` → red

---

## Manual Verification Checklist
- [ ] `localhost:3000` — home page loads with hero carousel, categories, live events, upcoming events, clubs section, footer
- [ ] Hero shows the "Spandan Annual Fest" (the seeded live event)
- [ ] Upcoming events section shows "Next.js Workshop"
- [ ] `localhost:3000/events` — all 3 seeded events appear
- [ ] Status filter "Live" → only "Spandan Annual Fest" appears
- [ ] Status filter "Upcoming" → only "Next.js Workshop" appears
- [ ] Status filter "Past" → only "Code Hackathon 2025" appears
- [ ] Search "next" → "Next.js Workshop" appears
- [ ] Category filter → filters correctly
- [ ] `localhost:3000/events/<id>` — event detail shows: title, club, category, date, venue, capacity bar, description
- [ ] Capacity progress bar shows 0/50 (or 0/200 for Spandan)
- [ ] `localhost:3000/clubs` — 4 club cards shown, clicking one goes to `/events?club=<id>`
- [ ] `localhost:3000/categories` — 6 category cards shown, clicking one goes to `/events?category=<id>`
- [ ] All pages work without being logged in (open incognito)
- [ ] No console errors in the browser

---

## Commit Message
```
feat: build public pages — home with hero/sections, events listing with search and filters, event detail, clubs, and categories
```

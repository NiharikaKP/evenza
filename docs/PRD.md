# PRD — EVENZA: Campus Event Management Platform

**Version:** 1.0  
**Date:** 2026-05-17  
**Status:** Approved

---

## Problem Statement

Students at a campus have no centralised place to discover, register for, and track events run by different clubs. Event information is scattered across WhatsApp groups, notice boards, and Instagram stories — making it easy to miss events, forget registrations, or show up at the wrong venue. Organizers face the reverse problem: they have no structured way to collect registrations, manage attendance, or gather custom information from attendees. There is also no reliable digital attendance system — most clubs still use paper registers or manual name checks at the door.

---

## Solution

EVENZA is a campus-wide web platform where students can browse all club events in one place, register with a single click, and receive a QR-based digital ticket. Organizers get a dashboard to create and manage events, collect custom registration data, and scan QR codes at the venue to mark attendance in real time. A minimal admin interface keeps the platform's clubs, categories, and featured content curated and clean.

---

## User Stories

### Student

1. As a student, I want to sign up with my email and password, so that I can create an account on the platform.
2. As a student, I want to complete an onboarding step after signing up where I enter my roll number, department, year, and interests, so that my profile is complete before I start browsing.
3. As a student, I want to browse all events on a public events page, so that I can discover what's happening on campus.
4. As a student, I want to filter events by status (All, Live, Upcoming, Past, Cancelled), so that I can find events relevant to where I am in time.
5. As a student, I want to filter events by category, so that I can find events that match my interests.
6. As a student, I want to filter events by club, so that I can follow a specific club's activities.
7. As a student, I want to search events by title, description, or club name, so that I can find a specific event quickly.
8. As a student, I want to see an event's capacity progress bar, so that I know how many seats are left before I decide to register.
9. As a student, I want to register for an event with a single click (when no custom fields are required), so that the process is as fast as possible.
10. As a student, I want a modal to appear when an event has custom registration fields, so that I can provide the required information as part of my registration.
11. As a student, I want the registration button to turn green after a successful registration, so that I get clear visual confirmation.
12. As a student, I want to be prevented from registering for the same event twice, so that I don't accidentally create duplicate registrations.
13. As a student, I want to see that a fully booked event has its registration button disabled and labelled "Full", so that I know I cannot register.
14. As a student, I want to unregister from an event before it starts, so that I can free up my spot if my plans change.
15. As a student, I want to be prevented from unregistering after an event has started, so that seat counts remain accurate on the day.
16. As a student, I want to view all my registered events in my profile under "My Events", so that I can keep track of what I've signed up for.
17. As a student, I want to see upcoming and past registered events separated, so that I can easily find my next event.
18. As a student, I want to view my QR code ticket for each registered event in my profile, so that I can show it for attendance.
19. As a student, I want my QR code to only be active during the event's running hours (between start and end time), so that it cannot be misused before or after.
20. As a student, I want to edit my profile fields (name, roll number, department, year) at any time, so that my information stays accurate.
21. As a student, I want to edit my interest categories in my profile, so that the platform can personalise content for me.
22. As a student, I want to see the home page without logging in, so that I can get a feel for the platform before signing up.
23. As a student, I want to see a hero slideshow of featured events on the home page, so that I notice the most important upcoming events immediately.
24. As a student, I want to see all event categories on the home page, so that I can jump directly to events in a category I care about.
25. As a student, I want my interest categories to be visually highlighted in the home page categories section, so that I can quickly find events aligned with my preferences.
26. As a student, I want to see a section of live events and a section of upcoming events on the home page, so that I get a quick overview without going to the full events page.
27. As a student, I want to browse all clubs on the `/clubs` page, so that I can discover clubs I might be interested in.
28. As a student, I want clicking a club to take me to the events page filtered for that club, so that I can see all that club's events.
29. As a student, I want to browse all categories on the `/categories` page, so that I can see what kinds of events are available.
30. As a student, I want clicking a category to take me to the events page filtered for that category, so that I can quickly find relevant events.

### Organizer

31. As an organizer, I want to access an organizer dashboard, so that I have a dedicated space to manage my events.
32. As an organizer, I want to see summary stats (total events, total registrations, currently active events) on my dashboard, so that I can monitor my event portfolio at a glance.
33. As an organizer, I want to create a new event by filling in a form with title, description, venue, category, club, start date/time, end date/time, and total seats, so that I can publish events for students to discover and register.
34. As an organizer, I want the club dropdown to show only clubs I've been assigned to, so that I cannot create events on behalf of clubs I don't represent.
35. As an organizer, I want to add up to 5 custom text fields to an event (each marked required or optional), so that I can collect specific information from attendees during registration.
36. As an organizer, I want to optionally add a Google Drive folder link to an event, so that I can share post-event photos and resources with attendees.
37. As an organizer, I want to see a table of all events I've created, so that I can manage them from one place.
38. As an organizer, I want to edit an event I've created (update details, increase capacity), so that I can correct mistakes or accommodate more attendees.
39. As an organizer, I want to cancel an event, so that registered students see it marked as "Cancelled" rather than it disappearing silently.
40. As an organizer, I want to view the full attendee list for each event, so that I know who is coming.
41. As an organizer, I want to see each attendee's name, email, QR token, custom field responses, and attendance status, so that I have all the information I need.
42. As an organizer, I want to open a fullscreen QR scanner page on my phone for a specific event, so that I can scan attendees at the venue door.
43. As an organizer, I want the scanner to immediately show a green success state when a valid QR is scanned, so that I can process attendees quickly.
44. As an organizer, I want the scanner to show a clear error when a QR is invalid (wrong event, outside time window, or already scanned), so that I can identify issues at the door.
45. As an organizer, I want the QR to be automatically deactivated after a successful scan, so that the same ticket cannot be used to enter twice.
46. As an organizer, I want to also register for events as a student (using the same account), so that I don't need two separate accounts.

### Admin

47. As an admin, I want to promote any user to organizer role, so that they gain access to the organizer dashboard.
48. As an admin, I want to demote an organizer back to student role, so that I can revoke access when needed.
49. As an admin, I want to create clubs (with name, description, logo image, and category), so that organizers can associate events with them.
50. As an admin, I want to edit and delete clubs, so that I can keep the club list accurate.
51. As an admin, I want to assign clubs to organizers (many-to-many), so that organizers only see the clubs they're authorised to represent.
52. As an admin, I want to create and manage categories, so that events and clubs can be properly classified.
53. As an admin, I want to pick which events are featured in the home page hero slideshow, so that important events get maximum visibility.
54. As an admin, I want to upload a logo image for each club stored in Vercel Blob, so that clubs have a consistent visual identity across the platform.

---

## Implementation Decisions

### Module Overview

**1. Auth Module**
- Better Auth with email/password strategy only
- Three roles: `student` (default on signup), `organizer`, `admin`
- Middleware enforces onboarding completion before accessing any protected page
- Role-based route guards: `/organizer/*` requires `organizer` or `admin` role; `/admin` requires `admin` role

**2. Onboarding Module**
- Post-signup redirect to `/onboarding`
- Collects: roll number, department, year, interest categories (multi-select from admin-managed list)
- Middleware checks an `onboardingComplete` flag on the user record; redirects until filled

**3. User/Profile Module**
- Profile page at `/profile` with two tabs: **Profile** and **My Events**
- Profile tab: edit name, roll number, department, year, interests
- My Events tab: registered events split into Upcoming and Past, each showing event card + QR code

**4. Club Module**
- Admin creates/edits/deletes clubs
- Each club: name, description, category (one), logo image URL (Vercel Blob)
- Admin assigns clubs to organizers via a join table (organizer ↔ club, many-to-many)
- Club image is inherited by all events belonging to that club — no per-event image upload

**5. Category Module**
- Admin creates/edits/deletes categories (name only, used for both events and clubs)
- Categories are the basis for student interest selection in onboarding and profile

**6. Event Module**
- Organizer creates events; club dropdown filtered to their assigned clubs
- Event fields: title, description, venue, category (one), club, start_time, end_time, total_seats, google_drive_url (optional), custom_fields (`JSONB`: `[{label, required}]`), is_featured (boolean), is_cancelled (boolean)
- Status is computed (never stored): `Upcoming` / `Live` / `Past` / `Cancelled`
  - `Cancelled` if `is_cancelled = true`
  - `Live` if `now` is between `start_time` and `end_time`
  - `Upcoming` if `start_time > now`
  - `Past` if `end_time < now`
- Organizer can cancel an event (sets `is_cancelled = true`); no hard delete
- Organizer can increase `total_seats`; registration disabled when `registered_count >= total_seats`

**7. Registration Module**
- Registration flow branches on whether event has custom fields:
  - No custom fields → one-click register
  - Custom fields present → modal with text inputs → submit
- Server-side checks before insert: seat availability + no duplicate registration
- On success: insert registration record with UUID QR token; respond with token
- Custom field responses stored as `JSONB` on registration record: `[{label, value}]`
- Unregistration: allowed only if `now < event.start_time`; hard-deletes the registration record

**8. QR / Attendance Module**
- QR token is a UUID stored on the registration record
- QR code displayed as a scannable image in the student's My Events tab (generated client-side from the UUID using a QR library)
- QR is "active" only when `now` is between event `start_time` and `end_time`
- Scanner page at `/organizer/events/:id/scan`: fullscreen, phone-optimised, uses in-browser camera via a QR scanning library
- On scan: POST to validation endpoint → check token exists + belongs to this event + time window valid + `scanned = false` → set `attended = true`, `scanned = true` → return success
- Error states: invalid token, wrong event, outside time window, already scanned

**9. Search & Filter Module**
- Events page supports: free-text search (title, description, club name), status filter, category filter, club filter
- Filters compose server-side (Drizzle query with `where` clauses)
- Pagination: fixed page size (e.g., 12 events per page)

**10. Admin Module**
- Single protected page `/admin`
- Sections: User Management (search users, toggle role), Club Management (CRUD + club-organizer assignment), Category Management (CRUD), Featured Events (pick events for hero slideshow)
- Admin identity is a hardcoded email or first user with `admin` role seeded in the DB

### Schema (key shapes)

```
users: id, name, email, password_hash, role, roll_number, department, year, onboarding_complete, interests (JSONB array of category IDs)

clubs: id, name, description, category_id, image_url

categories: id, name

organizer_clubs: organizer_id, club_id  (join table)

events: id, title, description, venue, category_id, club_id, organizer_id, start_time, end_time, total_seats, google_drive_url, custom_fields (JSONB), is_featured, is_cancelled, created_at

registrations: id, event_id, user_id, qr_token (UUID), custom_responses (JSONB), attended, scanned, registered_at
```

### API Contracts (key endpoints)

- `POST /api/events/:id/register` — register; body includes custom field responses if any
- `DELETE /api/events/:id/register` — unregister; blocked if `now >= event.start_time`
- `POST /api/scan/:eventId` — validate and consume QR token; body `{ token }`
- `PATCH /api/admin/users/:id/role` — promote/demote user
- `POST /api/admin/clubs/:id/image` — upload club logo to Vercel Blob

---

## Out of Scope

- Email notifications of any kind (registration confirmation, reminders, cancellation alerts)
- Waitlist system — seats are first-come, first-served only
- Multiple categories per event
- Non-text custom field types (dropdowns, checkboxes, number inputs, file uploads)
- Google OAuth or any third-party OAuth provider
- Per-event image uploads — club image is the event image
- Hard deletion of events — cancellation only
- Public event creation (organizers only, by admin assignment)
- Mobile native app
- Programmatic tests of any kind — v1 is verified manually

---

## Further Notes

- **Tech stack:** Next.js 16, Shadcn UI (preset `b88r6lY52I`), Better Auth, Drizzle ORM, Neon (Postgres), Vercel Blob
- **Deployment:** Vercel; Neon connected via Vercel integration
- **QR library candidates:** `html5-qrcode` or `@zxing/browser` for scanning; `qrcode` or `react-qr-code` for display
- **Club image as event image:** This is a deliberate simplification. If two clubs co-host an event, the organizer picks whichever club is primary — no multi-club event support in v1
- **Admin seeding:** The first admin account should be seeded directly in the DB; there is no self-service admin signup
- **Computed status:** Never store event status in the DB. Always derive it at query time from `start_time`, `end_time`, and `is_cancelled`. This prevents stale status bugs
- **QR active window:** The same `start_time`/`end_time` that computes "Live" status also governs QR validity — one source of truth

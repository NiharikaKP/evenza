# Phase 5 — Organizer Dashboard

## Goal
Build the complete organizer dashboard: summary stats, event creation form (with custom fields builder), events table with edit/cancel actions, and a per-event attendee list viewer. Organizers only see their own events and only the clubs they are assigned to.

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
- `@actions/registrations.ts`

---

## Prerequisites
- Phases 1–4 must be complete
- Seed organizer account exists: `organizer@evenza.com` / `password123`
- Seed organizer is assigned to CodeCraft and Spandan clubs

---

## Task Checklist

### 1. Create Organizer Query Layer
- [ ] Create `lib/queries/organizer.ts`:
  - `getOrganizerEvents(organizerId)` — all events by this organizer, with club + category + registration count
  - `getOrganizerStats(organizerId)` — returns `{ totalEvents, totalRegistrations, activeEvents }` where activeEvents = events where now is between startTime and endTime and isCancelled = false
  - `getOrganizerClubs(organizerId)` — clubs assigned to this organizer (via `organizerClubs` join table)
  - `getEventAttendees(eventId, organizerId)` — registrations for an event, verify the event belongs to this organizer, join with user data (name, email), return all fields including customResponses, attended, scanned

### 2. Create Organizer Server Actions
- [ ] Create `actions/organizer.ts` with `'use server'` at the top
- [ ] `createEvent(data)`:
  1. Get session — throw if not organizer or admin
  2. Verify the clubId is in the organizer's assigned clubs
  3. Validate: endTime > startTime, totalSeats > 0, max 5 custom fields
  4. Insert event
  5. `revalidatePath('/organizer')`
  6. Return `{ eventId }`
- [ ] `updateEvent(eventId, data)`:
  1. Get session — throw if not organizer/admin
  2. Verify event belongs to this organizer
  3. Validate same rules as createEvent
  4. Capacity can only be increased, never decreased below current registration count
  5. Update event fields
  6. `revalidatePath('/organizer')` and `revalidatePath('/events/' + eventId)`
- [ ] `cancelEvent(eventId)`:
  1. Get session — throw if not organizer/admin
  2. Verify event belongs to this organizer
  3. Set `isCancelled = true`
  4. `revalidatePath('/organizer')` and `revalidatePath('/events/' + eventId)`

### 3. Create Organizer Dashboard Page
- [ ] Create `app/organizer/page.tsx` as a Server Component
- [ ] Get session — if not organizer/admin, redirect to `/` (middleware also handles this, but be explicit)
- [ ] Fetch in parallel: `getOrganizerStats`, `getOrganizerEvents`, `getOrganizerClubs`, `getCategories`
- [ ] Pass all data to client components as props

### 4. Stats Section
- [ ] Create `components/organizer/StatsCards.tsx` (RSC)
- [ ] Three Shadcn `Card` components side by side:
  - Total Events (count)
  - Total Registrations (sum across all organizer's events)
  - Active Events (currently live)

### 5. Create Event Form
- [ ] Create `components/organizer/CreateEventForm.tsx` as a `'use client'` component
- [ ] Wrap in a Shadcn `Card` with heading "Create New Event"
- [ ] Fields:
  - Title (text input, required)
  - Description (textarea, required)
  - Venue (text input, required)
  - Category (Shadcn Select, options from `categories` prop, required)
  - Club (Shadcn Select, options from `organizerClubs` prop — only assigned clubs, required)
  - Start Date & Time (datetime-local input, required)
  - End Date & Time (datetime-local input, required — must be after start)
  - Total Seats (number input, min 1, required)
  - Google Drive URL (text input, optional, validate it's a URL)
  - **Custom Fields Builder:**
    - "Add Field" button — adds a row with: field label (text input) + required toggle (Switch) + remove button
    - Maximum 5 fields — disable "Add Field" at 5
    - Fields are stored as an array in component state
- [ ] Client-side validation before submitting
- [ ] On submit: call `createEvent()` Server Action via `useTransition`
- [ ] Show success message and reset form on success
- [ ] Show error message on failure

### 6. Events Table
- [ ] Create `components/organizer/EventsTable.tsx` as a `'use client'` component
- [ ] Use Shadcn `Table` component
- [ ] Columns: Title, Club, Category, Date, Seats (registered/total), Status badge, Actions
- [ ] Status badge uses `getEventStatus()` utility
- [ ] Actions per row:
  - "Edit" → opens Edit Event modal/sheet
  - "Cancel" → confirmation dialog → calls `cancelEvent()` Server Action
  - "View Attendees" → toggles the attendees panel below (or links to an anchor)
  - Cancelled events: show faded row, no Edit/Cancel actions (only "View Attendees")

### 7. Edit Event Sheet/Modal
- [ ] Create `components/organizer/EditEventSheet.tsx` as a `'use client'` component
- [ ] Use Shadcn `Sheet` (slide-in panel) for editing
- [ ] Same fields as the create form, pre-populated with event data
- [ ] For `totalSeats`: show current registration count, prevent decreasing below it
- [ ] On submit: call `updateEvent()` Server Action

### 8. Attendees Viewer
- [ ] Create `components/organizer/AttendeesViewer.tsx` as a `'use client'` component
- [ ] Shown below (or beside) the events table when "View Attendees" is clicked
- [ ] Fetch attendees client-side by calling a new route handler `GET /api/organizer/events/[eventId]/attendees` OR pass as a Server Action that returns data
  > Preferred: create a Server Action `getEventAttendees(eventId)` in `actions/organizer.ts` that returns the attendee list (this avoids a separate route handler)
- [ ] Display as a table:
  - Name, Email, Registered At, Attendance Status (Attended / Not Yet), Custom Field Responses
- [ ] Show empty state if no registrations
- [ ] "Back to Events" button to close

---

## Manual Verification Checklist
- [ ] Sign in as `organizer@evenza.com`
- [ ] `localhost:3000/organizer` loads the dashboard
- [ ] Stats cards show correct numbers (3 events, correct registration count, 1 active)
- [ ] Events table shows all 3 seeded events with correct status badges
- [ ] Create a new event:
  - Club dropdown only shows "CodeCraft" and "Spandan" (not all clubs)
  - Fill all fields, add 2 custom fields, submit
  - New event appears in the table immediately
- [ ] Edit the new event: change title and increase seats → changes reflected in table
- [ ] Try decreasing seats below current registrations → error shown
- [ ] Cancel the new event → row shows "Cancelled" status, Edit/Cancel actions hidden
- [ ] Click "View Attendees" on "Spandan Annual Fest" → see the student who registered in Phase 4
- [ ] Attendee row shows their name, email, and attendance status "Not Yet"
- [ ] Sign in as `student@evenza.com` → try visiting `/organizer` → redirected away

---

## Commit Message
```
feat: build organizer dashboard with stats, event creation/edit/cancel, and attendee list viewer
```

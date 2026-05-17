# Phase 6 — QR Scanner + Attendance

## Goal
Build the fullscreen QR scanner page for organizers, the scan validation API endpoint, and wire up attendance marking. After this phase, an organizer can open the scanner on their phone at the venue, scan a student's QR code, and see real-time attendance confirmation or a clear error.

---

## Context Files
Read all of these before writing a single line of code:
- `@docs/PRD.md`
- `@docs/architecture.md`
- `@lib/db/schema.ts`
- `@lib/db/index.ts`
- `@lib/auth.ts`
- `@middleware.ts`
- `@app/organizer/page.tsx`

---

## Prerequisites
- Phases 1–5 must be complete
- At least one registration exists in the DB (from Phase 4 testing)
- The student's QR code is visible in their profile under My Events

---

## Task Checklist

### 1. Install QR Scanner Library
- [ ] Run: `bun add html5-qrcode`

### 2. Create the Scan API Endpoint
- [ ] Create `app/api/scan/[eventId]/route.ts`
- [ ] `POST` handler only
- [ ] Logic (in order):
  1. Get session from request headers — return `401` if not authenticated or not organizer/admin
  2. Await `params` to get `eventId` (Next.js 16 — params is a Promise)
  3. Parse request body: `{ token: string }`
  4. Find registration where `qrToken = token` — return `{ success: false, error: 'invalid_token', message: 'QR code not found' }` if not found
  5. Verify `registration.eventId === eventId` — return `{ success: false, error: 'wrong_event', message: 'This QR code is for a different event' }` if mismatch
  6. Fetch the event — verify it exists and is not cancelled
  7. Check current time is between `event.startTime` and `event.endTime` — return `{ success: false, error: 'outside_window', message: 'Scanning is only allowed during the event' }` if outside window
  8. Check `registration.scanned === false` — return `{ success: false, error: 'already_scanned', message: 'This ticket has already been scanned' }` if already used
  9. Update registration: `attended = true`, `scanned = true`
  10. Return `{ success: true, message: 'Attendance marked!', attendeeName: user.name }`
- [ ] All DB operations in this endpoint must be wrapped in a transaction to prevent race conditions (two simultaneous scans of the same token)

### 3. Create Scanner Page (Server Shell)
- [ ] Create `app/organizer/events/[id]/scan/page.tsx` as a Server Component
- [ ] Await `params` to get `id`
- [ ] Fetch event from DB — call `notFound()` if event doesn't exist or organizer doesn't own it
- [ ] Pass `event.id`, `event.title`, and `event.startTime`/`endTime` to the Client Component
- [ ] The page has no nav or layout chrome — it's fullscreen for phone use
- [ ] Tip: create a separate `app/organizer/events/[id]/scan/layout.tsx` that renders `{children}` without the shared nav layout (or use a route group)

### 4. Create QR Scanner Client Component
- [ ] Create `components/organizer/QRScanner.tsx` as a `'use client'` component
- [ ] Import `html5-qrcode` dynamically (`ssr: false`)
- [ ] Full implementation:

  ```
  State:
  - scanResult: { success: boolean; message: string; attendeeName?: string } | null
  - isPaused: boolean

  On mount:
  - Initialize Html5QrcodeScanner with id "qr-reader", fps: 10, qrbox: 250
  - Start scanning

  On successful decode:
  - Pause scanner
  - POST to /api/scan/{eventId} with the decoded token
  - Set scanResult from response
  - After 2500ms: clear result and resume scanner

  On unmount:
  - Clear the scanner instance

  UI:
  - Event name and date at top (small header)
  - Camera viewfinder div (id="qr-reader") — full width, max 400px
  - Result overlay:
    - Success: large green checkmark, attendee name, "Attendance Marked"
    - Error: large red X, error message
  - Scan count display: "X attendees scanned today" (optional)
  ```

- [ ] The component must handle camera permission denial gracefully with a clear message
- [ ] "Back to Dashboard" link at the bottom

### 5. Add Scanner Link in Organizer Dashboard
- [ ] In the Events Table (`components/organizer/EventsTable.tsx`), add a "Scan QR" button/link per row
- [ ] Only show for events that are currently Live (status = live) — for other statuses, show a disabled button with tooltip "Only available during event"
- [ ] Link to `/organizer/events/<eventId>/scan`

### 6. Update Attendees Viewer to Show Attendance
- [ ] The attendees table in `components/organizer/AttendeesViewer.tsx` already has an "Attendance Status" column
- [ ] Verify it correctly shows "Attended" (green badge) vs "Not Yet" (gray badge) based on the `attended` field
- [ ] After scanning, the organizer can refresh the attendees viewer to see the updated status

---

## Manual Verification Checklist

**Setup for testing:**
- [ ] The seeded "Spandan Annual Fest" event is currently Live (startTime in past, endTime in future)
- [ ] The test student (`student@evenza.com`) is registered for it (from Phase 4)
- [ ] Sign in as `student@evenza.com`, go to Profile → My Events → find "Spandan Annual Fest" QR code
- [ ] The QR shows "Active" status

**Scanner page:**
- [ ] Sign in as `organizer@evenza.com`
- [ ] In events table, "Spandan Annual Fest" row shows "Scan QR" button (not disabled)
- [ ] Click "Scan QR" → navigates to `/organizer/events/<id>/scan`
- [ ] Page is fullscreen, no nav bar
- [ ] Camera permission prompt appears — allow it
- [ ] Camera viewfinder appears

**Successful scan:**
- [ ] Scan the student's QR code (show the phone screen to the laptop camera or use another device)
- [ ] Green success overlay appears with student name and "Attendance Marked!"
- [ ] After 2.5 seconds, overlay disappears and scanner resumes
- [ ] Go to Attendees Viewer for this event → student shows "Attended" status

**Error cases:**
- [ ] Scan the same QR again → red overlay "This ticket has already been scanned"
- [ ] Manually change event times to be outside current time in DB → scan any QR → "Scanning is only allowed during the event"
- [ ] Try accessing `/organizer/events/<id>/scan` as student → redirected (middleware blocks)

**Upcoming event:**
- [ ] In events table, "Next.js Workshop" row → "Scan QR" button is disabled
- [ ] Hover shows tooltip or the button is visually greyed out

---

## Commit Message
```
feat: add fullscreen QR scanner page, scan validation API with race-condition protection, and live attendance marking
```

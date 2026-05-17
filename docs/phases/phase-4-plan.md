# Phase 4 — Registration + Student Profile

## Goal
Implement the full student registration flow: one-click registration (no custom fields), custom fields modal, QR token generation, unregistration, and the profile page with two tabs — Edit Profile and My Events (with QR code display).

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
- `@lib/queries/events.ts`

---

## Prerequisites
- Phases 1, 2, and 3 must be complete
- The event detail page at `/events/[id]` exists with a placeholder registration button

---

## Task Checklist

### 1. Create Registration Server Actions
- [ ] Create `actions/registrations.ts` with `'use server'` at the top
- [ ] Implement `registerForEvent(eventId: string, customResponses: { label: string; value: string }[])`:
  1. Get session via `auth.api.getSession({ headers: await headers() })` — throw if not authenticated
  2. Fetch event from DB — throw if not found or cancelled
  3. Check `now < event.endTime` — throw if event is over
  4. Count current registrations for this event — throw with "Event is full" if `count >= event.totalSeats`
  5. Check no existing registration for this user+event — throw "Already registered" if exists
  6. Validate required custom fields are present in `customResponses`
  7. Insert registration: `qrToken` is auto-generated UUID (via `$defaultFn` in schema)
  8. `revalidatePath('/events/' + eventId)` and `revalidatePath('/profile')`
  9. Return `{ success: true }`
- [ ] Implement `unregisterFromEvent(eventId: string)`:
  1. Get session — throw if not authenticated
  2. Fetch event — throw if not found
  3. Check `now < event.startTime` — throw "Cannot unregister after event has started" if too late
  4. Delete registration where `eventId` and `userId` match
  5. `revalidatePath('/events/' + eventId)` and `revalidatePath('/profile')`
  6. Return `{ success: true }`

### 2. Update Event Detail Page
- [ ] In `app/events/[id]/page.tsx`, additionally fetch:
  - The current user's registration for this event (if logged in): `getRegistrationByUserAndEvent(userId, eventId)`
  - Current registration count
- [ ] Add query `lib/queries/registrations.ts`:
  - `getRegistrationByUserAndEvent(userId, eventId)` — returns registration or null
  - `getRegistrationCount(eventId)` — returns count of registrations
- [ ] Pass `registration`, `registrationCount`, `session`, and `event` to a Client Component `<EventRegistrationSection />`

### 3. Create `EventRegistrationSection` Client Component
- [ ] Create `components/events/EventRegistrationSection.tsx` as a `'use client'` component
- [ ] Receives: `event`, `registration` (null if not registered), `registrationCount`, `isAuthenticated`
- [ ] Renders the **Capacity Progress Bar** (Shadcn `Progress`) — always visible
- [ ] **Button states:**
  - Not authenticated → "Sign in to Register" button linking to `/sign-in`
  - Event is cancelled → disabled button "Cancelled"
  - Event is past → disabled button "Event Ended"
  - Event is full and user not registered → disabled button "Full"
  - User is registered → green "Registered ✓" button + "Unregister" link below it
  - Default → "Register" button (active)
- [ ] **Registration flow:**
  - If `event.customFields.length === 0` → clicking "Register" directly calls `registerForEvent(eventId, [])` via `useTransition`
  - If `event.customFields.length > 0` → clicking "Register" opens the custom fields modal
- [ ] **On successful registration:** button turns green ("Registered ✓") without page reload — use optimistic UI or rely on `revalidatePath` + router refresh
- [ ] **Unregistration:** clicking "Unregister" calls `unregisterFromEvent(eventId)` with confirmation. Button reverts to "Register" on success.

### 4. Create Custom Fields Modal
- [ ] Create `components/events/CustomFieldsModal.tsx` as a `'use client'` component
- [ ] Uses Shadcn `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`
- [ ] Renders one `Input` per custom field from `event.customFields`
- [ ] Required fields show `*` and are validated before submit
- [ ] On submit: calls `registerForEvent(eventId, responses)` via `useTransition`
- [ ] Shows loading state during submission
- [ ] Closes and triggers success state on completion
- [ ] Shows error message if action throws

### 5. Create Profile Server Action
- [ ] Add to `actions/profile.ts` (or create it):
  - `updateProfile(data: { name, rollNumber, department, year, interests })`:
    1. Get session — throw if not authenticated
    2. Update user fields in DB
    3. `revalidatePath('/profile')`

### 6. Create Profile Page
- [ ] Create `app/profile/page.tsx` as a Server Component
- [ ] Fetch: current session (redirect to `/sign-in` if not authenticated), user's registrations with event data joined
- [ ] Add query `getRegistrationsByUser(userId)` to `lib/queries/registrations.ts` — returns registrations joined with events, ordered by event startTime DESC
- [ ] Fetch all categories (for the interests multi-select)
- [ ] Render Shadcn `Tabs` with two tabs:

  **Tab 1: Profile**
  - Client Component form with fields: Name, Roll Number, Department, Year (select), Interests (multi-select checkboxes)
  - Pre-populated with current user data
  - On submit: calls `updateProfile()` Server Action
  - Show success toast/message on completion

  **Tab 2: My Events**
  - Split into two sections: **Upcoming & Live** and **Past & Cancelled**
  - Each registration shows: EventCard + QR Code
  - QR Code component (see next task)

### 7. Create QR Code Display Component
- [ ] Install: `bun add react-qr-code`
- [ ] Create `components/profile/QRTicket.tsx` as a `'use client'` component
- [ ] Import `QRCode` dynamically with `ssr: false` (browser-only)
- [ ] Display the QR code (value = `registration.qrToken`)
- [ ] Show "Active" badge if event is currently live, "Inactive" with grayscale effect otherwise
- [ ] Note beneath QR: "Valid only during event hours. Single use."
- [ ] Add a label showing the event name and date below the QR

---

## Manual Verification Checklist

**Registration — no custom fields:**
- [ ] Sign in as `student@evenza.com`
- [ ] Go to "Spandan Annual Fest" event detail (the live event)
- [ ] Click "Register" → button turns green "Registered ✓" immediately
- [ ] Refresh the page → button is still green

**Registration — with custom fields:**
- [ ] Go to "Next.js Workshop" event detail (has custom field "Laptop brand")
- [ ] Click "Register" → modal appears with "Laptop brand" text input
- [ ] Submit without filling required field → validation error shows
- [ ] Fill and submit → modal closes, button turns green

**Full event:**
- [ ] Temporarily set `totalSeats = 1` on an event in DB and register with student account
- [ ] Sign out, sign up as a new account → that event shows "Full" disabled button
- [ ] Restore `totalSeats`

**Unregistration:**
- [ ] On a registered upcoming event → "Unregistered" link appears → click → confirmation → button reverts to "Register"
- [ ] Manually set a live event's `startTime` to 1 hour ago → "Unregister" is blocked with an error

**Profile page:**
- [ ] `localhost:3000/profile` → two tabs visible
- [ ] Profile tab: fields pre-filled with user data, edit name and save → change persists on refresh
- [ ] Interests: select 2 categories, save → reflected on home page (highlighted categories)
- [ ] My Events tab: registered events appear with QR codes
- [ ] QR code on the live event ("Spandan Annual Fest") shows "Active"
- [ ] QR code on the upcoming event shows "Inactive"
- [ ] Visit `/profile` while logged out → redirected to `/sign-in`

---

## Commit Message
```
feat: implement event registration flow, custom fields modal, QR token display, and student profile page
```

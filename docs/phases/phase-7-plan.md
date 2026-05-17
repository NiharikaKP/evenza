# Phase 7 — Admin Panel + Vercel Blob

## Goal
Build the complete admin panel: user role management, club CRUD with real image uploads via Vercel Blob, category CRUD, organizer-club assignment, and featured event picker for the home page hero. This is the final phase — after it, the platform is fully operational.

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
- Phases 1–6 must be complete
- `.env.local` has `BLOB_READ_WRITE_TOKEN` (set up Vercel Blob in Vercel dashboard, or use `vercel env pull` to get it locally)
- Admin account `admin@evenza.com` / `password123` is in the DB

---

## Task Checklist

### 1. Set Up Vercel Blob
- [ ] Confirm `@vercel/blob` is already installed (from Phase 1)
- [ ] Add `BLOB_READ_WRITE_TOKEN` to `.env.local` (get from Vercel dashboard → Storage → Blob)
- [ ] Create `app/api/upload/route.ts`:
  - `POST` handler only
  - Authenticate — return `401` if not admin
  - Accept `multipart/form-data` with a `file` field
  - Validate: file must be an image (`image/jpeg`, `image/png`, `image/webp`), max 2MB
  - Upload to Vercel Blob: `put('clubs/<uuid>-<filename>', file, { access: 'public' })`
  - Return `{ url: blob.url }`

### 2. Create Admin Query Layer
- [ ] Create `lib/queries/admin.ts`:
  - `getAllUsers(search?: string)` — all users, optional name/email search, ordered by createdAt DESC
  - `getOrganizerClubAssignments(organizerId)` — clubs assigned to a specific organizer
  - `getAllEvents(search?: string)` — all events with club + category, for the featured picker

### 3. Create Admin Server Actions
- [ ] Create `actions/admin.ts` with `'use server'` at the top
- [ ] `setUserRole(userId: string, role: 'student' | 'organizer' | 'admin')`:
  1. Get session — throw if not admin
  2. Prevent admin from demoting themselves
  3. Update user role
  4. `revalidatePath('/admin')`
- [ ] `createClub(data: { name, description, categoryId, imageUrl })`:
  1. Get session — throw if not admin
  2. Insert club
  3. `revalidatePath('/admin')` and `revalidatePath('/clubs')`
- [ ] `updateClub(clubId, data)`:
  1. Get session — throw if not admin
  2. Update club
  3. `revalidatePath('/admin')` and `revalidatePath('/clubs')`
- [ ] `deleteClub(clubId)`:
  1. Get session — throw if not admin
  2. Check no events reference this club — throw "Cannot delete club with existing events" if any exist
  3. Delete club (cascade removes organizerClubs rows)
  4. `revalidatePath('/admin')` and `revalidatePath('/clubs')`
- [ ] `createCategory(name: string)`:
  1. Get session — throw if not admin
  2. Insert category
  3. `revalidatePath('/admin')` and `revalidatePath('/categories')`
- [ ] `updateCategory(categoryId, name)`:
  1. Get session — throw if not admin
  2. Update category
  3. `revalidatePath('/admin')` and `revalidatePath('/categories')`
- [ ] `deleteCategory(categoryId)`:
  1. Get session — throw if not admin
  2. Check no clubs or events reference this category — throw if any exist
  3. Delete category
  4. `revalidatePath('/admin')` and `revalidatePath('/categories')`
- [ ] `assignClubToOrganizer(organizerId, clubId)`:
  1. Get session — throw if not admin
  2. Verify user is an organizer
  3. Insert into `organizerClubs` with `onConflictDoNothing()`
  4. `revalidatePath('/admin')`
- [ ] `removeClubFromOrganizer(organizerId, clubId)`:
  1. Get session — throw if not admin
  2. Delete from `organizerClubs`
  3. `revalidatePath('/admin')`
- [ ] `setEventFeatured(eventId: string, isFeatured: boolean)`:
  1. Get session — throw if not admin
  2. Update `events.isFeatured`
  3. `revalidatePath('/admin')` and `revalidatePath('/')` (home page hero)

### 4. Create Admin Page
- [ ] Create `app/admin/page.tsx` as a Server Component
- [ ] Get session — redirect to `/` if not admin
- [ ] Fetch in parallel: users, clubs (with categories), categories, events (for featured picker)
- [ ] Render four sections using Shadcn `Tabs`:
  - Tab 1: Users
  - Tab 2: Clubs
  - Tab 3: Categories
  - Tab 4: Featured Events

### 5. Users Tab
- [ ] Create `components/admin/UsersTable.tsx` as a `'use client'` component
- [ ] Search input (filters users client-side by name/email)
- [ ] Table columns: Name, Email, Role, Actions
- [ ] Actions per row: Role select dropdown (Student / Organizer / Admin) → on change, call `setUserRole()`
- [ ] When role = "organizer": show "Manage Clubs" button that opens the Club Assignment Sheet
- [ ] Cannot change own role (disable actions row for current admin)

### 6. Club Assignment Sheet
- [ ] Create `components/admin/ClubAssignmentSheet.tsx` as a `'use client'` component
- [ ] Shadcn `Sheet` — slide in from right
- [ ] Shows organizer name at top
- [ ] Lists all clubs with a checkbox per club — checked if already assigned
- [ ] On checkbox toggle: call `assignClubToOrganizer` or `removeClubFromOrganizer`
- [ ] Changes apply immediately (no save button needed)

### 7. Clubs Tab
- [ ] Create `components/admin/ClubsManager.tsx` as a `'use client'` component
- [ ] Table of existing clubs: Name, Category, Image preview (small thumbnail), Actions (Edit, Delete)
- [ ] "Add Club" button opens a Shadcn `Dialog` with the club form
- [ ] Club form fields:
  - Name (text, required)
  - Description (textarea, optional)
  - Category (Select from categories list, required)
  - Logo Image (file input — `accept="image/jpeg,image/png,image/webp"`, max 2MB)
- [ ] On file select: preview the image locally before uploading
- [ ] On form submit:
  1. Upload image via `POST /api/upload` → get back URL
  2. Call `createClub({ name, description, categoryId, imageUrl })` Server Action
- [ ] Edit: opens same dialog pre-populated; if user selects a new image, upload and replace URL
- [ ] Delete: confirmation dialog → calls `deleteClub()` → row disappears

### 8. Categories Tab
- [ ] Create `components/admin/CategoriesManager.tsx` as a `'use client'` component
- [ ] Simple list of categories with inline edit (click name → editable input) or a small modal
- [ ] "Add Category" button → input + save
- [ ] Delete button per category (with guard: blocked if category has clubs/events)
- [ ] Calls `createCategory`, `updateCategory`, `deleteCategory` Server Actions

### 9. Featured Events Tab
- [ ] Create `components/admin/FeaturedEventsManager.tsx` as a `'use client'` component
- [ ] List of all non-cancelled, non-past events
- [ ] Star/toggle button per event — filled star = featured, empty = not featured
- [ ] On toggle: calls `setEventFeatured(eventId, !current)` Server Action
- [ ] Show how many events are currently featured (e.g., "3 featured")
- [ ] Note: no hard limit enforced, but UI shows a recommended max of 5

### 10. Update Club Images on Public Pages
- [ ] Now that real club images can be uploaded, verify that:
  - Club cards on `/clubs` display the real image from Vercel Blob via `next/image`
  - Event cards show the club's image (inherited from club)
  - `next.config.ts` already has the Vercel Blob hostname in `remotePatterns` (from Phase 1)
- [ ] Upload real images for the 4 seeded clubs via the admin panel

### 11. Polish: Replace Placeholder Images
- [ ] After uploading real logos for the 4 seeded clubs, verify:
  - Home page hero events show real club images
  - Events page cards show real club images
  - Clubs page shows real club logos

---

## Manual Verification Checklist

**Role management:**
- [ ] Sign in as `admin@evenza.com`
- [ ] `localhost:3000/admin` → admin panel loads with 4 tabs
- [ ] Users tab shows all 3 seed users
- [ ] Change `student@evenza.com` role to "Organizer" → role dropdown updates
- [ ] Sign in as that student → `/organizer` is now accessible
- [ ] Change them back to Student → `/organizer` access revoked
- [ ] Try changing own (admin) role → action is disabled or throws error

**Club management:**
- [ ] Create a new club: fill name + category, upload a real image (JPG/PNG)
- [ ] Image preview shows before submission
- [ ] Club appears in the table after creation with thumbnail
- [ ] Club appears on `/clubs` page with real image
- [ ] Edit the club: change description → update reflects on clubs page
- [ ] Delete the club (confirm it has no events) → removed from table and clubs page
- [ ] Try uploading a non-image file → error shown
- [ ] Try uploading an image > 2MB → error shown

**Club-organizer assignment:**
- [ ] Click "Manage Clubs" for the test organizer
- [ ] Sheet shows all clubs with checkboxes
- [ ] Uncheck "CodeCraft" → sign in as organizer → CodeCraft no longer in event creation dropdown
- [ ] Re-check "CodeCraft" → appears again in dropdown

**Category management:**
- [ ] Add new category "Gaming" → appears in categories page and event creation dropdown
- [ ] Edit "Gaming" → "Esports" → change reflected everywhere
- [ ] Delete "Esports" (no clubs/events) → removed

**Featured events:**
- [ ] Star "Next.js Workshop" → go to home page → appears in hero carousel
- [ ] Unstar it → disappears from hero

**Blob images:**
- [ ] Upload real logos for all 4 seeded clubs via admin panel
- [ ] `/clubs` shows real images
- [ ] Event cards on `/events` show real club images (from club's imageUrl)
- [ ] No broken image placeholders remain

---

## Commit Message
```
feat: build admin panel with user role management, club and category CRUD, Vercel Blob image upload, organizer-club assignment, and featured event picker
```

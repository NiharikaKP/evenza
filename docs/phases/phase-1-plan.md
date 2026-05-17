# Phase 1 — Scaffold + Database + Seed

## Goal
Bootstrap the entire project foundation: Next.js app with Shadcn UI, Drizzle ORM connected to Neon, full database schema migrated, and seed data loaded so every later phase has real data to work with.

---

## Context Files
Read all of these before writing a single line of code:
- `@docs/PRD.md`
- `@docs/architecture.md`

---

## Prerequisites (do these manually before starting)
1. Create a Neon project at neon.tech and copy the connection string
2. Create a `.env.local` file in the project root with:
   ```
   DATABASE_URL=<your-neon-connection-string>
   ```

---

## Task Checklist

### 1. Scaffold Next.js + Shadcn
- [ ] Run: `bunx --bun shadcn@latest init --preset b88r6lY52I --template next --pointer`
- [ ] Verify `components.json` is created and `components/ui/` is populated
- [ ] Verify `tailwind.config.ts` and `globals.css` are set up by Shadcn
- [ ] Remove all boilerplate content from `app/page.tsx` (replace with a single `<h1>EVENZA</h1>`)
- [ ] Remove boilerplate from `app/globals.css` (keep only Shadcn's generated styles)

### 2. Install Dependencies
- [ ] Run: `bun add drizzle-orm @neondatabase/serverless`
- [ ] Run: `bun add -d drizzle-kit`
- [ ] Run: `bun add @vercel/blob`

### 3. Configure Drizzle
- [ ] Create `drizzle.config.ts` at project root:
  ```ts
  import { defineConfig } from 'drizzle-kit';

  export default defineConfig({
    schema: './lib/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: { url: process.env.DATABASE_URL! },
  });
  ```
- [ ] Add scripts to `package.json`:
  ```json
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:studio": "drizzle-kit studio",
  "db:seed": "bun run lib/db/seed.ts"
  ```

### 4. Create Database Connection
- [ ] Create `lib/db/index.ts` using the HTTP adapter (Vercel/serverless — see architecture.md)

### 5. Create Full Schema
- [ ] Create `lib/db/schema.ts` with all tables as defined in `docs/architecture.md`:
  - `users` (with role, rollNumber, department, year, interests JSONB, onboardingComplete)
  - `categories`
  - `clubs` (with imageUrl, categoryId)
  - `organizerClubs` (join table with composite primary key)
  - `events` (with customFields JSONB, isFeatured, isCancelled)
  - `registrations` (with qrToken UUID, customResponses JSONB, attended, scanned, unique constraint on eventId+userId)

### 6. Run Migration
- [ ] Run: `bun run db:generate`
- [ ] Run: `bun run db:migrate`
- [ ] Verify in Neon console that all tables exist

### 7. Configure `next.config.ts`
- [ ] Add Vercel Blob remote image pattern:
  ```ts
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
  ```

### 8. Create and Run Seed Script
- [ ] Create `lib/db/seed.ts` that inserts:

  **Categories (6):**
  - Tech, Cultural, Sports, Literary, Music, Workshop

  **Clubs (4):**
  - CodeCraft → Tech category, placeholder imageUrl: `https://placehold.co/400x400/png`
  - Spandan → Cultural category, placeholder imageUrl
  - Strikers FC → Sports category, placeholder imageUrl
  - Wordsmiths → Literary category, placeholder imageUrl

  **Users (3) — passwords hashed with bcrypt or Better Auth's hasher:**
  > Note: In Phase 1, insert users directly with a hashed password. Better Auth will manage sessions in Phase 2, but the users table structure is compatible.
  - Admin: `{ email: 'admin@evenza.com', name: 'Admin', role: 'admin', onboardingComplete: true }`
  - Organizer: `{ email: 'organizer@evenza.com', name: 'Test Organizer', role: 'organizer', onboardingComplete: true }`
  - Student: `{ email: 'student@evenza.com', name: 'Test Student', role: 'student', onboardingComplete: true }`
  - Use password `password123` for all three (hash it using `crypto.subtle` or a simple bcrypt call)

  **organizerClubs:** Assign organizer to CodeCraft and Spandan

  **Events (3):**
  - "Next.js Workshop" → Tech / CodeCraft / organizer
    - startTime: 3 days from now, endTime: 4 days from now, totalSeats: 50
    - customFields: `[{ label: "Laptop brand", required: false }]`
  - "Spandan Annual Fest" → Cultural / Spandan / organizer
    - startTime: 1 hour ago, endTime: 3 hours from now, totalSeats: 200 (this makes it "Live")
    - customFields: `[]`
  - "Code Hackathon 2025" → Tech / CodeCraft / organizer
    - startTime: 10 days ago, endTime: 9 days ago, totalSeats: 100 (this makes it "Past")
    - customFields: `[]`

- [ ] Run: `bun run db:seed`
- [ ] Verify rows exist in Neon console for all tables

### 9. Create Utility Function
- [ ] Create `lib/utils.ts` with:
  - `cn()` from `clsx` + `tailwind-merge` (Shadcn likely already created this — verify, don't duplicate)
  - `getEventStatus(event)` function as defined in `docs/architecture.md`

### 10. Verify Dev Server
- [ ] Run: `bun dev`
- [ ] Confirm app loads at `localhost:3000` with no errors

---

## Manual Verification Checklist
- [ ] `bun dev` runs without errors
- [ ] `localhost:3000` shows the page (even just "EVENZA" heading)
- [ ] Neon console shows all 6 tables: `users`, `categories`, `clubs`, `organizer_clubs`, `events`, `registrations`
- [ ] Neon console shows seed data: 3 users, 6 categories, 4 clubs, 3 events

---

## Commit Message
```
feat: scaffold Next.js + Shadcn, configure Drizzle + Neon, define schema, seed initial data
```

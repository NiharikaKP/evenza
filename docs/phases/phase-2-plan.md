# Phase 2 — Authentication + Middleware + Onboarding

## Goal
Implement full authentication: sign-up, sign-in, sign-out, role-based middleware, and the post-signup onboarding flow. By the end of this phase, all three seed accounts can log in, the admin and organizer routes are protected, and new users are forced through onboarding before accessing the app.

---

## Context Files
Read all of these before writing a single line of code:
- `@docs/PRD.md`
- `@docs/architecture.md`
- `@lib/db/schema.ts`
- `@lib/db/index.ts`

---

## Prerequisites
- Phase 1 must be complete (schema migrated, seed data loaded)
- `.env.local` has `DATABASE_URL`

---

## Task Checklist

### 1. Install Better Auth
- [ ] Run: `bun add better-auth`

### 2. Add Environment Variables
- [ ] Add to `.env.local`:
  ```
  BETTER_AUTH_SECRET=<run: openssl rand -base64 32>
  BETTER_AUTH_URL=http://localhost:3000
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  ```

### 3. Create Better Auth Server Instance
- [ ] Create `lib/auth.ts` as defined in `docs/architecture.md`
- [ ] Use the Drizzle adapter with the `pg` provider
- [ ] Enable `emailAndPassword`
- [ ] Declare `additionalFields` for: `role`, `rollNumber`, `department`, `year`, `interests`, `onboardingComplete`

### 4. Generate Better Auth Schema
- [ ] Run: `bunx @better-auth/cli@latest generate --output lib/db/schema-auth.ts`
- [ ] Inspect the generated file — it defines `sessions`, `accounts`, `verifications` tables
- [ ] Merge or import these into the migration (or add them to `schema.ts` if preferred)
- [ ] Run: `bun run db:generate && bun run db:migrate`
- [ ] Verify new auth tables exist in Neon console

### 5. Create Better Auth Route Handler
- [ ] Create `app/api/auth/[...all]/route.ts` using `toNextJsHandler(auth)`
- [ ] Verify `GET /api/auth/ok` returns `{ ok: true }` in the browser

### 6. Create Auth Client
- [ ] Create `lib/auth-client.ts` as defined in `docs/architecture.md`
- [ ] Export: `authClient`, `signIn`, `signUp`, `signOut`, `useSession`

### 7. Create Middleware
- [ ] Create `middleware.ts` at project root as defined in `docs/architecture.md`
- [ ] Public routes (no auth required): `/`, `/events`, `/events/:id`, `/clubs`, `/categories`, `/sign-in`, `/sign-up`
- [ ] Authenticated but onboarding incomplete → redirect to `/onboarding`
- [ ] `/organizer/*` requires `organizer` or `admin` role
- [ ] `/admin` requires `admin` role
- [ ] Set `config.matcher` to exclude `api`, `_next/static`, `_next/image`, `favicon.ico`

### 8. Create Sign-Up Page
- [ ] Create `app/(auth)/sign-up/page.tsx`
- [ ] Form fields: Name, Email, Password, Confirm Password
- [ ] On submit: call `signUp.email()` from auth-client
- [ ] On success: redirect to `/onboarding`
- [ ] On error: show inline error message
- [ ] Link to sign-in page at bottom
- [ ] Use Shadcn `Card`, `Input`, `Button`, `Label`, `Form` components

### 9. Create Sign-In Page
- [ ] Create `app/(auth)/sign-in/page.tsx`
- [ ] Form fields: Email, Password
- [ ] On submit: call `signIn.email()` from auth-client
- [ ] On success: redirect to `/` (middleware will redirect to onboarding if needed)
- [ ] On error: show inline error message
- [ ] Link to sign-up page at bottom
- [ ] Use Shadcn `Card`, `Input`, `Button`, `Label`, `Form` components

### 10. Create Onboarding Page
- [ ] Create `app/(auth)/onboarding/page.tsx`
- [ ] This is a Server Component that fetches the current session and all categories from DB
- [ ] Render a Client Component form with:
  - Roll Number (text input)
  - Department (text input)
  - Year (select: 1st, 2nd, 3rd, 4th, Alumni)
  - Interests (multi-select checkboxes — one per category from DB)
- [ ] On submit: call a Server Action `actions/profile.ts → completeOnboarding(data)`
  - The action updates user: `rollNumber`, `department`, `year`, `interests`, `onboardingComplete: true`
  - After update: redirect to `/`
- [ ] Page should be inaccessible if already onboarded (middleware handles redirect)

### 11. Create Root Layout with Nav
- [ ] Update `app/layout.tsx` to include a basic navigation bar:
  - Logo / "EVENZA" text linking to `/`
  - Links: Events, Clubs, Categories
  - If authenticated: show user name + Sign Out button
  - If not authenticated: show Sign In + Sign Up buttons
  - If role is `organizer` or `admin`: show "Dashboard" link to `/organizer`
  - If role is `admin`: show "Admin" link to `/admin`
- [ ] Nav must be a Client Component (needs `useSession`)
- [ ] Layout itself stays a Server Component — extract `<Navbar />` as the Client Component

### 12. Sign Out
- [ ] Sign Out button in nav calls `signOut()` from auth-client then redirects to `/`

### 13. Protect Seed User Passwords
- [ ] The seed script in Phase 1 inserted users without proper Better Auth password hashing
- [ ] Re-seed or update the 3 seed users via Better Auth's `signUp.email()` API call (or use Better Auth's password hasher directly in the seed script)
- [ ] Confirm all 3 seed users can sign in

---

## Manual Verification Checklist
- [ ] `localhost:3000/sign-up` — create a brand new account → lands on `/onboarding`
- [ ] Fill onboarding form → lands on home page `/`
- [ ] Nav shows the logged-in user's name and a Sign Out button
- [ ] Sign Out → nav shows Sign In / Sign Up
- [ ] `localhost:3000/sign-in` — sign in as `admin@evenza.com` / `password123` → lands on `/`
- [ ] Sign in as `admin@evenza.com` → Nav shows "Admin" link
- [ ] Manually visit `localhost:3000/admin` while signed in as student → redirected away
- [ ] Manually visit `localhost:3000/organizer` while signed in as student → redirected away
- [ ] `localhost:3000/organizer` while signed in as `organizer@evenza.com` → not redirected (page may be empty, that's fine)
- [ ] Create a fresh account, skip onboarding by navigating to `/events` → redirected back to `/onboarding`
- [ ] `GET /api/auth/ok` in browser → returns `{ ok: true }`

---

## Commit Message
```
feat: add Better Auth email/password auth, role-based middleware, sign-in/sign-up pages, and onboarding flow
```

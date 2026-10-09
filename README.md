# Aurum Collection: Exclusive Car & Yacht Hire Platform

**Aurum Collection** is a database-driven web application with a public luxury booking showcase and an invisible, role-protected admin back-office. Built for clients who cannot easily access rare vehicles and private yachts: restored classics, modern flagships, and crewed yachts for weddings, high-profile events, and discerning travel.

---

## 1. Opening in VS Code

This folder (`c:\Users\david\Downloads\AURUM COLLECTION`) is the complete, self-contained project root.

1. Open **VS Code**.
2. Click **File > Open Folder...** (or press `Ctrl + K, Ctrl + O`).
3. Select this folder: `AURUM COLLECTION`.
4. Open the integrated terminal (`Ctrl + ~`) and start developing right away with `npm run dev`.

---

## 2. Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI & Components**: React 18, TypeScript, Tailwind CSS
- **Typography**: Cormorant Garamond (headings) & Inter (body) via `next/font`
- **Database**: PostgreSQL (Cloud-ready on Neon / Vercel Postgres / local PostgreSQL)
- **ORM**: Prisma with migrations and serializable transaction concurrency control
- **Authentication**: NextAuth.js (Credentials provider, JWT session strategy, bcrypt hashing)
- **Validation**: Shared Zod schemas (client-side form validation and server-side action validation)
- **Testing**: Vitest unit & security suites, concurrent race-condition test script, live role-access check

---

## 3. Database & PostgreSQL Configuration

The application is configured to connect to PostgreSQL with support for **both direct connections and Vercel connection pooling**.

### Configured Environment Variables (`.env.local` and `.env`)

```env
# Neon PostgreSQL Cloud (Vercel-ready with connection pooling)
DATABASE_URL="postgresql://neondb_owner:npg_A9eTUGMiDc1j@ep-misty-sea-b5gd3vbe-pooler.c-7.us-east-2.aws.neon.tech/aurum?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:npg_A9eTUGMiDc1j@ep-misty-sea-b5gd3vbe.c-7.us-east-2.aws.neon.tech/aurum?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="aurum-collection-ultra-secure-jwt-secret-key-2026-production"

# Seeded testing credentials
SEED_ADMIN_EMAIL="admin@aurum.example"
SEED_ADMIN_PASSWORD="Admin#2026Aurum"
SEED_CLIENT_EMAIL="client@aurum.example"
SEED_CLIENT_PASSWORD="Client#2026Aurum"
```

> **Note**: Both `.env` and `.env.local` are already populated and functional. The database schema has already been migrated (`prisma/migrations/20261009100359_init`) and seeded with the full collection, users, sample bookings, and inquiries.

### Running Migrations & Seeding Manually

If you ever reset the database or connect to another PostgreSQL server:

```bash
# Run migrations (creates tables and applies migration history)
npm run db:migrate -- --name init

# Or deploy existing migrations without prompting
npm run db:deploy

# Seed fleet items, admin & client users, sample bookings, and inquiries
npm run db:seed
```

---

## 4. Connecting and Deploying to Vercel

The application is 100% prepared for Vercel deployment:

1. Push this project to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "feat: complete Aurum Collection platform"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```
2. Import the project in the [Vercel Dashboard](https://vercel.com/new).
3. Under **Environment Variables**, add:
   - `DATABASE_URL`: Your pooled PostgreSQL connection string (e.g. from Neon or Vercel Postgres).
   - `DIRECT_URL`: Your direct PostgreSQL connection string (for migrations).
   - `NEXTAUTH_URL`: `https://your-production-domain.vercel.app`
   - `NEXTAUTH_SECRET`: A secure random secret string (e.g. generated via `openssl rand -base64 32`).
4. `postinstall` in `package.json` automatically runs `prisma generate` during the Vercel build step.
5. Click **Deploy**. Vercel will build and deploy the production app without any issues.

---

## 5. Login Credentials

Pre-seeded accounts created by `prisma/seed.ts`:

| Role | Portal URL | Email | Password |
|---|---|---|---|
| **Client** | `/login` | `client@aurum.example` | `Client#2026Aurum` |
| **Admin** | `/admin/login` *(unlinked, secret staff portal)* | `admin@aurum.example` | `Admin#2026Aurum` |

### Creating Additional Admin Accounts

Because `/register` is strictly client-only and strips any `role` payload, administrator accounts can never be created through the public website. To create another administrator from the terminal:

```bash
npm run create-admin
```

Follow the prompts for name, email, and password.

---

## 6. Fleet Images & Placeholder Fallback

All provided images are stored in `public/images/`.

### Missing Images (`modern-2-main.jpg` and `modern-3-main.jpg`)

- Per Section 3 specifications, `modern-2-main.jpg` (Rolls-Royce Ghost) and `modern-3-main.jpg` (Bentley Continental GT) are marked as pending.
- The `FleetImage` component (`src/components/FleetImage.tsx`) automatically detects missing images or load errors, gracefully falling back to a bespoke luxury placeholder featuring:
  - Deep charcoal gradient (`from-[#262626] via-[#1a1a1a] to-[#121212]`)
  - Thin gold hairline border
  - Aurum ornamental crest
  - Item name in Cormorant Garamond serif with "Photograph coming soon"
- The site never renders broken-image icons or empty boxes.

### Swapping In Real Photos Later

The pending files have been staged in `public/images/pending/`:
- `public/images/pending/modern-2-main.jpg`
- `public/images/pending/modern-3-main.jpg`

To make the actual photographs live without any code changes:
1. Move or copy `modern-2-main.jpg` and `modern-3-main.jpg` from `public/images/pending/` into `public/images/`.
2. Refresh the browser. The photos will immediately appear!

---

## 7. Core Business & Security Architecture

1. **Booking Buffer & Availability**:
   - Each hire occupies dates from start to end date inclusive.
   - A **1-day preparation buffer** is automatically enforced after every hire to ensure vehicle/vessel detailing and mechanical checks.
   - Overlap formula: `newStart <= existingEnd + buffer AND newEnd + buffer >= existingStart`. Only `PENDING` and `CONFIRMED` bookings block dates.
2. **Double Booking Prevention (Serializable Transactions)**:
   - Creation of bookings occurs inside a PostgreSQL `$transaction` at `isolationLevel: Serializable`.
   - If two clients attempt to book overlapping dates simultaneously, the database aborts the conflicting request with code `P2034`, which is caught and transformed into a clean message: *"These dates were just taken. Please choose different dates."*
3. **Admin Invisibility**:
   - The `/admin/login` route is completely unlinked (never appears in navigation, footer, or sitemap).
   - Any client or unauthenticated user trying to access any `/admin/*` route receives an authentic **404 Not Found**, never a 403 or redirect that would reveal the route exists.
   - `requireAdmin()` re-verifies user role in the PostgreSQL database on every request (demoting a user takes effect immediately).
4. **Rate Limiting & Timing Attack Protection**:
   - Failed logins are limited to 5 attempts per email + IP per 15 minutes.
   - Dummy bcrypt hash compare runs when an email does not exist to prevent timing attacks.
   - All login failures return the uniform error: *"Invalid email or password."*

---

## 8. Running Tests & Verification

### Unit & Security Tests (Vitest)

```bash
npm test
```
Verifies date parsing, booking buffer calculations, edge-case date overlaps, password policies, rate limiters, admin guards, and `requireAdmin` enforcement (44 tests passing).

### Concurrency Stress Test

```bash
npm run test:concurrency
```
Fires 10 simultaneous booking requests for the exact same vehicle and dates. Proves that PostgreSQL Serializable isolation permits exactly 1 booking and rejects the remaining 9 with conflict errors.

### Role-Access Security Test

```bash
# Terminal 1: start the server
npm run dev

# Terminal 2: run access checks
npm run test:access
```
Runs 35 automated checks verifying that logged-out visitors and clients receive 404s on all admin pages and APIs, while authenticated admins get 200 OK.

---

## 9. Screenshots to Capture for Your Report

Capture these 13 screenshots to document every requirement:

1. **Home page (`/`)**: Hero section with Jaguar E-Type, luxury typography, and featured collection cards.
2. **Fleet page with filter (`/fleet?collection=YACHT`)**: Filter tab selected, showcasing the yacht cards with daily rates and availability badges.
3. **Fleet detail page (`/fleet/classic-jaguar-etype`)**: Specifications, history, condition, blocked dates display, and booking request form.
4. **Validation error on booking form**: End date selected prior to start date or dates inside a preparation buffer day.
5. **Booking conflict message**: Error toast/message: *"These dates were just taken. Please choose different dates."*
6. **Client Sign in / Register (`/login`)**: Desktop split screen with moody hero image on the left and gold-bordered card on the right.
7. **Registration form with validation & password strength**: Live password strength indicator bars responding to input.
8. **My Bookings page (`/account`)**: Logged-in client bookings with status badges and the "Cancel booking" action on a PENDING booking.
9. **Admin Dashboard (`/admin`)**: Three primary stat cards (Fleet items, Bookings with pending count, Inquiries with new count).
10. **Admin Fleet CRUD (`/admin/fleet`)**: Fleet table with Edit/Deactivate/Delete actions, and the safe delete/deactivate confirmation dialog.
11. **Admin Bookings list (`/admin/bookings`)**: Table with status filter tabs (All, Pending, Confirmed, Cancelled) and Confirm/Cancel actions.
12. **The 404 page for a client on `/admin`**: Proving the admin area is completely invisible and unreachable to non-administrators.
13. **Terminal test results**: Output of `npm test`, `npm run test:concurrency`, and `npm run test:access` all passing.

---

## 10. Folder Structure

```
AURUM COLLECTION/
├── prisma/
│   ├── migrations/          # Version-controlled PostgreSQL migrations
│   │   └── 20261009100359_init/
│   ├── schema.prisma        # Database schema with models & indexes
│   └── seed.ts              # Database seed script (13 fleet items, 2 users, bookings)
├── public/
│   └── images/              # All fleet & site photographs, logo.png
│       └── pending/         # Staged pending photos (modern-2, modern-3)
├── scripts/
│   ├── access-check.ts      # Automated role-access test suite (35 checks)
│   ├── concurrency.ts       # Serializable isolation concurrency stress test
│   ├── create-admin.ts      # CLI script for provisioning new administrators
│   └── env.ts               # Environment variable loader
├── src/
│   ├── app/
│   │   ├── (auth)/          # Client login & register routes
│   │   ├── (public)/        # Home, about, fleet, fleet/[id], contact, account
│   │   ├── admin/           # (panel) dashboard, fleet, bookings, inquiries, audit, login
│   │   ├── api/             # auth, register, admin/stats API endpoints
│   │   ├── globals.css      # Luxury dark & gold styles, buttons, animations
│   │   ├── layout.tsx       # Root layout with Cormorant Garamond & Inter fonts
│   │   └── not-found.tsx    # Styled 404 page
│   ├── components/          # Reusable UI (Navbar, Footer, FleetImage, Forms, Admin UI)
│   └── lib/                 # Auth options, Prisma client, booking logic, Zod validation
├── tests/                   # Vitest unit test suites
├── .env.example             # Template environment variables
├── .env.local               # Configured local/cloud environment variables
└── package.json             # Scripts, dependencies, and configuration
```
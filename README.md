# UrbanNest - Premium Room Finding & Booking Platform

UrbanNest is an end-to-end, production-ready, modern property marketplace designed for discovering, listing, and booking rooms, PGs, apartments, hostels, and shared stays across major Indian cities (Prayagraj, Bengaluru, Pune, Delhi NCR, Hyderabad, Mumbai, and Chennai).

Built with **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, **Razorpay Payments**, and **Leaflet Interactive Maps**.

---

## Key Features

### 1. Tenant Experience
- **Hero Multi-Parameter Search**: Search by city, move-in date, room type, and budget.
- **Split-Screen Search (`/rooms`)**: Synchronized 3-column desktop layout (Left: Category filters, Center: Property cards, Right: Interactive Leaflet Map).
- **Comprehensive Filters**: City, area, rent slider (₹4,000–₹45,000+), room type, property type, furnishing, amenities, gender preferences, verified-only, and food included.
- **Immersive Property Details (`/property/[id]`)**: 5-photo showcase, fullscreen lightbox gallery, amenities icon grid, transit & college connectivity, and verified tenant reviews.
- **Sticky Booking Widget & Checkout**: Live price calculation (monthly rent, refundable deposit, maintenance, platform fee, GST) and instant Razorpay checkout.
- **Side-by-Side Property Comparison (`/compare`)**: Compare up to 4 properties with best-price highlights.
- **Favorites (`/favorites`)**: Save rooms with heart burst animation.
- **Tenant Dashboard (`/dashboard`)**: Track booking statuses (`REQUESTED`, `ACCEPTED`, `CONFIRMED`), view official receipts, and manage profile preferences.

### 2. Property Owner Experience
- **Owner Dashboard (`/owner/dashboard`)**: KPIs (total properties, active listings, pending inquiries, estimated earnings, impressions).
- **Tenant Applications Manager**: Review incoming tenant requests, view tenant occupation/profiles, and 1-click **Accept** or **Decline**.
- **10-Step Listing Wizard (`/owner/properties/new`)**:
  - Step 1: Basic Information
  - Step 2: Location & Transit Landmarks
  - Step 3: Rent & Security Deposits
  - Step 4: Furnishing & Space Dimensions
  - Step 5: Amenities Selection
  - Step 6: Photos & Media
  - Step 7: Availability & Lease Terms
  - Step 8: Tenant Preferences
  - Step 9: House Rules
  - Step 10: Live Listing Preview & Instant Publish
- **Listing Management**: Toggle publish/pause, edit rent, and monitor occupancy.

### 3. Platform Administration & Trust
- **Admin Moderation Portal (`/admin`)**: Platform revenue, total bookings, user counts, and gross volume.
- **Property Verification Queue**: Inspect submitted owner listings and ID documents; 1-click approve or reject to issue the green **Verified Stay** badge.
- **User Directory**: View tenant and host accounts.

### 4. Zero-Friction Multi-Persona Testing
- **Instant Role Switcher**: Floating switcher on the bottom right to toggle between:
  - **Tenant**: `Rahul Sharma` (`rahul.sharma@example.com`)
  - **Property Owner**: `Rajesh Mehra` (`rajesh.mehra@example.com`)
  - **Super Admin**: `Priya Sharma` (`admin@urbannest.com`)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) + React 18 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + Custom Design System |
| **Icons** | Lucide React |
| **Database & ORM** | SQLite (zero-config local) / PostgreSQL (production) with Prisma ORM |
| **Maps** | Leaflet + OpenStreetMap (custom dark/light tiles, custom price pin markers) |
| **Payments** | Razorpay Order Creation + HMAC Verification + Simulator Checkout |
| **Auth** | Session-based cookie auth with bcrypt password hashing |

---

## Quick Start & Local Setup

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd "room finder"
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` settings:
```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
JWT_SECRET="urbannest-super-secret-production-key-90210"
RAZORPAY_KEY_ID="rzp_test_urbannest123"
RAZORPAY_KEY_SECRET="rzp_secret_demoSecret456"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_urbannest123"
```

### 3. Initialize Database & Seed Demo Data
```bash
# Push schema to SQLite database
npx prisma db push

# Seed 20+ realistic properties, 10 owners, 10 tenants, bookings, and reviews
node prisma/seed.js
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Accounts

You can log in manually or use the **Instant Persona Switcher** at the bottom right:

| Role | Email | Password | Primary Workflow |
|---|---|---|---|
| **Tenant** | `rahul.sharma@example.com` | `password123` | Search, compare, request booking, pay deposit, chat |
| **Owner** | `rajesh.mehra@example.com` | `password123` | Accept inquiries, manage listings, 10-step wizard |
| **Admin** | `admin@urbannest.com` | `admin123` | Verify properties, inspect stats, manage directory |

---

## API Architecture

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Email/password sign in |
| `POST` | `/api/auth/register` | Register tenant or property owner |
| `GET` | `/api/auth/me` | Fetch active session user |
| `POST` | `/api/auth/switch-demo` | Instant 1-click persona switch |
| `GET` | `/api/properties` | Search & multi-parameter filter listings |
| `POST` | `/api/properties` | Create new property listing |
| `GET` | `/api/properties/[id]` | Single property full details |
| `PATCH` | `/api/properties/[id]` | Update status (`PUBLISHED`, `PAUSED`) or pricing |
| `POST` | `/api/properties/[id]/favorite` | Toggle favorite status |
| `GET` | `/api/bookings` | Fetch user or owner bookings |
| `POST` | `/api/bookings` | Submit booking request |
| `PATCH` | `/api/bookings/[id]` | Update booking status (`ACCEPTED`, `REJECTED`, `CONFIRMED`) |
| `POST` | `/api/payments/create` | Generate Razorpay order |
| `POST` | `/api/payments/verify` | Verify HMAC payment signature and confirm booking |
| `GET` | `/api/messages` | List user conversation threads |
| `POST` | `/api/messages` | Send message in chat thread |
| `GET` | `/api/admin/analytics` | Platform KPIs and financials |
| `POST` | `/api/admin/verifications` | Approve or reject property verifications |

---

## Switching to PostgreSQL for Production

In `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
Set your PostgreSQL URL in `.env`:
```env
DATABASE_URL="postgresql://postgres:password@your-host:5432/urbannest?schema=public"
```
Run migrations:
```bash
npx prisma db push
node prisma/seed.js
```

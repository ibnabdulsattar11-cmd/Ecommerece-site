# E-Commerce Platform — Phase 1 (Foundation)

## What's included
- **backend/** — Express + Sequelize + PostgreSQL scaffold, all core DB models (User, Address, Category, Product, ProductVariant, ProductImage, Cart, CartItem, Order, OrderItem, Coupon, CouponUsage, Review, Wishlist, Return, Notification, DeliveryZone) with associations wired in `src/models/index.js`. Security middlewares (helmet, rate limiting, hpp, xss-clean, CORS, JSON body limits) are already applied in `src/app.js`.
- **frontend/** — Next.js (JavaScript, App Router) with `next-intl` i18n: `/en` (LTR) and `/ar` (RTL) routes, language switcher, Tailwind CSS configured with logical spacing utilities for RTL-safety.

## Backend setup
```bash
cd backend
npm install
cp .env.example .env   # then fill in your PostgreSQL credentials, JWT secrets, etc.
createdb ecommerce_db  # or create the DB via your Postgres client
npm run dev            # starts on http://localhost:5000, auto-syncs models in dev
```
`GET http://localhost:5000/api/health` should return `{ success: true }`.

## Frontend setup
```bash
cd frontend
npm install
npm run dev             # starts on http://localhost:3000
```
Visit `http://localhost:3000/en` or `http://localhost:3000/ar` — the language switcher in the navbar toggles between them and flips the page direction (LTR/RTL) automatically.

## Phase 2 — Auth & Users (done)

**Backend** (`/api/auth`, `/api/users`)
- Register (email and/or phone), login, logout
- JWT access tokens (15min, sent in Authorization header) + refresh tokens (7 days, httpOnly/secure/SameSite cookie scoped to `/api/auth`) with **rotation**: every refresh issues a new refresh token and invalidates the old hash in the DB, so a replayed stolen token is rejected
- Google OAuth (passport-google-oauth20) — links to an existing email account or creates a new one
- Email verification (24h expiring token) and password reset (1h expiring, single-use, hashed token) via Nodemailer
- Change password (invalidates all existing sessions)
- Profile: name, language preference, profile image upload (multer + sharp — re-encodes to strip EXIF/validate real image content, resizes to 512x512 webp)
- Multiple addresses per user: Home/Office/Other labels, one default address, auto-promotion of another address to default when the default one is deleted
- Order history endpoint (stub — returns empty until Phase 6/7 build real orders)
- Security: bcrypt (12 rounds), rate limiting on auth endpoints (20/15min), generic "invalid credentials" errors (no user enumeration), backend-enforced role checks (`restrictTo`) ready for the admin panel

**Frontend** (`/[locale]/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/auth/callback`, `/account`)
- Axios client: access token kept in memory (not localStorage, to reduce XSS token-theft risk), automatic silent refresh via the httpOnly cookie on 401s, request queuing during refresh
- Zustand auth store wired to the API, session restored on page load
- Login, register, forgot/reset password, email verification, Google OAuth callback pages
- Account page: profile summary, logout, and full address CRUD (add/delete/set default)

## What's NOT built yet (upcoming phases)
Product/category APIs & pages, cart, location/address geolocation system, checkout + Stripe, order management/tracking, returns, reviews, notifications, admin panel, analytics — Phases 3–11 per the project plan.

## Notes
- In production, replace `sequelize.sync({ alter: true })` in `server.js` with proper Sequelize migrations (`npm run migrate`) — sync is only safe for local development.
- Fill in `GOOGLE_CLIENT_ID`/`SECRET`, `SMTP_*`, and JWT secrets in `.env` for auth to fully work; without SMTP credentials, email/password reset emails will fail to send (registration/login still work).
- Remaining route files are stubbed as commented-out imports in `src/app.js`; they'll be uncommented as each module is built.

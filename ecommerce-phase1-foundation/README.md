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

## What's NOT built yet (upcoming phases)
Auth, product/category APIs & pages, cart, location/address system, checkout + Stripe, order management/tracking, returns, reviews, notifications, admin panel, analytics, and full security hardening (input validation schemas, CSRF, webhook handling) — these come in Phases 2–11 per the project plan.

## Notes
- In production, replace `sequelize.sync({ alter: true })` in `server.js` with proper Sequelize migrations (`npm run migrate`) — sync is only safe for local development.
- Route files are stubbed as commented-out imports in `src/app.js`; they'll be uncommented as each module (auth, products, cart, etc.) is built in the next phases.

# Storefront + Admin Panel — Next.js (JavaScript / ES6, no TypeScript)

Built on top of the existing bilingual (English/Arabic, RTL-aware) Next.js
14 App Router scaffold — same conventions (next-intl, zustand, axios with
token-refresh interceptor, JS-only via `jsconfig.json`), extended into a
complete storefront and admin panel.

**Verified**: `npm install && npm run build` completes clean (53 routes),
and `npm start` was smoke-tested end-to-end against the real backend —
home, product listing, product detail (with JSON-LD), login, cart, admin,
sitemap.xml and robots.txt all confirmed working.

---

## How to run

```bash
cp .env.example .env.local   # fill in your backend URL etc.
npm install
npm run dev                   # http://localhost:3000
```

---

## What's included

### Storefront (SEO-optimized, Server-Rendered)
- **Home** — hero, category grid, popular products, all server-rendered
- **Product listing** (`/products`) — server-rendered, category/price/sort/search filters via URL params (so filtered views are real, crawlable, shareable URLs), pagination
- **Product detail** (`/products/[slug]`) — server-rendered with:
  - `generateMetadata`: per-product title, description, canonical URL, Open Graph + Twitter cards
  - **JSON-LD structured data**: `Product` schema (price, availability, `AggregateRating`) + `BreadcrumbList` — powers Google's rich results (star ratings, price in search listings)
  - Image gallery, variant/quantity picker, add to cart, wishlist toggle
  - Reviews: rating breakdown, verified-purchase badges, helpful voting, submit-a-review form
  - Related products
- **Cart**, **Checkout** (address selection, coupon, Cash on Delivery + Stripe Elements), **Order confirmation**
- **Wishlist**
- **Account**: profile, addresses, orders list, order detail (status timeline, cancel, return request)
- **Auth**: login (rebuilt), register/forgot-password/reset-password/verify-email (pre-existing, functional)
- **`sitemap.xml`** — dynamically includes every product and category, in both locales, with `lastModified`
- **`robots.txt`** — allows storefront crawling, disallows `/admin`, `/account`, `/cart`, `/checkout`

### Admin Panel (`/admin`, role-guarded — redirects non-admins)
- **Dashboard** — revenue, order count, customer growth, low-stock alerts, recent orders, top products
- **Products** — list, create, edit (with image upload), delete
- **Categories** — create, edit, delete
- **Inventory** — stock levels, manual stock adjustment with audit note
- **Orders** — list with status filter, detail page with guided status transitions + tracking number entry
- **Customers** — search, block/unblock
- **Coupons** — create, activate/deactivate, delete
- **Reviews** — moderation queue (approve/reject pending reviews)

### Design system
- Custom Tailwind palette: deep navy primary (`primary-50`…`900`) + warm gold accent, semantic `success`/`danger`/`warning` colors
- Reusable component classes (`.btn-primary`, `.btn-outline`, `.card`, `.input`, `.badge`, etc.) in `globals.css` via `@layer components`
- Logical properties (`ms-`/`me-`/`ps-`/`pe-`) throughout for automatic RTL correctness in Arabic
- Focus-visible rings, hover/active states, consistent spacing and shadows

---

## SEO checklist — what's actually implemented

- [x] Server-rendered (not client-fetched) product listing and detail pages
- [x] Dynamic per-page title/meta-description via `generateMetadata`
- [x] Canonical URLs on every indexable page
- [x] Open Graph + Twitter card metadata
- [x] `Product` and `BreadcrumbList` JSON-LD structured data
- [x] Dynamic `sitemap.xml` (products, categories, both locales)
- [x] `robots.txt` excluding non-public sections
- [x] Semantic HTML (`nav aria-label`, `article`, breadcrumb `ol`, alt text on every image)
- [x] Real, crawlable filter URLs (`?category=`, `?search=`) instead of client-only state
- [x] `lang`/`dir` set correctly per locale on `html`

---

## Known follow-ups (not built — scope/time, flagging honestly)

- **Images use plain `img`, not `next/image`.** Deliberate trade-off: `next/image` needs the backend's upload host allow-listed in `next.config.js`, which varies per deployment. Swapping in `next/image` (automatic responsive sizes, lazy-loading, layout-shift prevention) is a worthwhile follow-up once the production image host is known.
- **Admin section still renders inside the storefront's global Navbar/Footer** (visible above the admin sidebar) — the root layout wraps everything under `[locale]`. Cosmetic, not functional; fixing it cleanly means moving `/admin` outside the localized route tree with its own layout.
- **`/admin/products/[id]/edit`** fetches the admin product list and finds the row client-side (no dedicated "get product by id" endpoint was in scope) — fine for a normal catalog size, not ideal at very large scale.
- **Static content pages** (About, FAQ, Shipping policy, Terms, Privacy) aren't built — footer intentionally only links to pages that exist, to avoid 404s hurting SEO. Add these and re-link from the footer when you have real copy for them.
- **i18n coverage**: navigation and the homepage are fully translated (`messages/en.json` / `ar.json`); most storefront and all admin components use inline English strings rather than translation keys, to fit the scope of this build. The bilingual routing/RTL infrastructure is fully wired — extending translation coverage to every string is straightforward from here.

# Phase 3 — Product Catalog (Deliverable)

Ye files aap ke maujooda `/backend` aur `/frontend` folders mein isi structure
ke sath copy/merge kar dein.

## Backend — kya add hua

```
backend/src/models/category.model.js
backend/src/models/product.model.js
backend/src/models/productVariant.model.js
backend/src/models/productImage.model.js
backend/src/models/index.js            (auto-loader — Phase 1/2 models bhi
                                         isi folder mein hon to automatically
                                         pick ho jayenge, associate() ke sath)
backend/src/controllers/category.controller.js
backend/src/controllers/product.controller.js
backend/src/routes/category.routes.js
backend/src/routes/product.routes.js
backend/src/validators/category.validator.js
backend/src/validators/product.validator.js
backend/src/middlewares/validate.middleware.js
backend/src/middlewares/admin.middleware.js
backend/src/services/upload.service.js  (Multer + Sharp — image resize + thumbnail)
backend/src/utils/slugify.js
```

### `app.js` mein mount karein

```js
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');

app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// static serve for uploaded product images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

### Naye packages (agar already install nahi hain)

```bash
npm install multer sharp
```

### Migrations

Sequelize `sync()` use kar rahe hain to models auto-create ho jayenge (dev
only). Production ke liye in models se migrations generate kar lein
(`sequelize-cli migration:generate`).

**Note:** `auth.middleware.js` Phase 2 mein already ban chuka hai — ye Phase 3
routes usi ko import kar rahe hain (`req.user` set karta hai JWT se).

---

## API Endpoints (naye)

```
GET    /api/categories?tree=true          → nested category tree (public)
GET    /api/categories/:slug              → single category (public)
POST   /api/categories                    → create (admin)
PUT    /api/categories/:id                → update (admin)
DELETE /api/categories/:id                → soft delete (admin)

GET    /api/products?page=&limit=&search=&category=&minPrice=&maxPrice=&brand=&sort=&inStock=
GET    /api/products/filters/meta         → distinct brands + price range (for filter UI)
GET    /api/products/recently-viewed?ids=id1,id2
GET    /api/products/:slug                → detail + related + recommended
GET    /api/products/admin/:id            → full detail incl. draft/inactive (admin)
POST   /api/products                      → create (admin)
PUT    /api/products/:id                  → update (admin)
DELETE /api/products/:id                  → soft delete (admin)
POST   /api/products/upload-images        → multipart upload, returns processed image URLs
```

### Product create/update flow (images)

1. Frontend pehle images ko `POST /api/products/upload-images` par bhejta hai
   (multipart, field name `images`, max 8 files, 5MB each).
2. Response mein `{ url, thumbnailUrl }` pairs milte hain.
3. Wahi URLs `POST /api/products` ke body mein `images: [...]` field mein
   bhej dein — controller unhe `ProductImage` rows mein link kar dega.

Isse image processing (resize/webp/thumbnail) upload step par hi ho jata hai,
aur product create/update sirf JSON deal karta hai — koi multipart parsing
wahan nahi karni parti.

---

## Frontend — kya add hua

```
frontend/lib/api/products.js                              (API client + recently-viewed localStorage helper)
frontend/components/ProductCard.jsx                        (bilingual, RTL-aware)
frontend/components/ProductFilters.jsx                     (price, brand, sort, in-stock)
frontend/app/[locale]/(shop)/products/page.jsx             (listing: search + filters + pagination)
frontend/app/[locale]/(shop)/products/[slug]/page.jsx      (detail: variants, related, recommended, recently viewed)
frontend/messages/products.en.json
frontend/messages/products.ar.json
```

`products.en.json` / `products.ar.json` ka content apni existing
`messages/en.json` aur `messages/ar.json` files ke andar merge kar dein
(ya next-intl multi-namespace loading use kar lein).

### Filters URL-driven hain

Listing page filters ko query string (`?search=&category=&sort=...`) mein
rakhta hai — is se filtered/sorted view shareable/bookmarkable ban jati hai,
aur back/forward browser buttons bhi sahi kaam karte hain.

---

## Jo cheezein abhi tak nahi ki (agle steps / dependencies)

- **Reviews model & avgRating update trigger** — jab Review create/update ho
  to `Product.avgRating` aur `reviewCount` recalculate karne wala hook Phase 8
  (Reviews) mein banega.
- **Cart integration ("Add to Cart" button)** — Phase 4 mein wire hoga.
- **Admin UI (product/category forms)** — Phase 9 (Admin Panel) mein banega;
  ye sirf backend APIs + customer-facing pages hain.
- **Full-text search** — abhi `ILIKE` based simple search hai. Bade catalog
  ke liye baad mein Postgres `tsvector` ya Meilisearch/Algolia recommend
  karunga.

---

## Quick test (backend)

```bash
# category banayein
curl -X POST http://localhost:5000/api/categories \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"nameEn":"Shoes","nameAr":"أحذية"}'

# product listing
curl "http://localhost:5000/api/products?page=1&limit=10&sort=newest"
```

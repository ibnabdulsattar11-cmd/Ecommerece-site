# Phase 4 — Cart & Wishlist (Deliverable)

## Backend — kya add hua

```
backend/src/models/cart.model.js
backend/src/models/cartItem.model.js
backend/src/models/wishlist.model.js
backend/src/controllers/cart.controller.js
backend/src/controllers/wishlist.controller.js
backend/src/routes/cart.routes.js
backend/src/routes/wishlist.routes.js
backend/src/validators/cart.validator.js
backend/src/services/cart.service.js          (findOrCreateCart, totals, guest→user merge)
backend/src/middlewares/guestCart.middleware.js (issues guest_cart_token cookie)
backend/src/middlewares/optionalAuth.middleware.js (JWT decode without rejecting)
```

### `app.js` mein mount karein

```js
const cookieParser = require('cookie-parser'); // npm install cookie-parser
app.use(cookieParser());

const cartRoutes = require('./routes/cart.routes');
const wishlistRoutes = require('./routes/wishlist.routes');

app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
```

### `.env`

`JWT_ACCESS_SECRET` already set from Phase 2 — `optionalAuth.middleware.js`
reuses it.

### Naya package

```bash
npm install cookie-parser
```

---

## Zaroori: login flow mein cart merge

Guest cart ko user ke account cart mein merge karna login/register ke
foran baad hona chahiye, warna guest items kho sakte hain. Do tareeqay hain:

**Option A (recommended) — server-side, Phase 2's login controller mein:**

```js
const { mergeGuestCartIntoUserCart } = require('../services/cart.service');

// ... after successful password check / token issue, before res.json():
await mergeGuestCartIntoUserCart(user.id, req.cookies.guest_cart_token);
res.clearCookie('guest_cart_token');
```

**Option B — client-side:** login success ke baad frontend
`useCartStore().mergeGuestCart()` call kare (`POST /api/cart/merge`).

Dono kaam karte hain — Option A zyada robust hai (network drop se bhi
protected), Option B simpler hai agar aap login controller edit nahi
karna chahte.

### Known caveat (Postgres unique index)

`cart_items` par unique index `(cartId, productId, variantId)` hai taake
duplicate add-to-cart rows na banein. Postgres NULL ko unique treat nahi
karta jaise normal value — matlab agar same product baar baar bina variant
(`variantId: null`) ke add ho, to controller ka `findOrCreate` (jo pehle
row dhoondta hai) is theek se handle kar leta hai, lekin agar kabhi direct
DB insert kiya jaye to duplicate NULL rows ban sakti hain. Application code
hamesha controller se hi guzarna chahiye, direct DB writes na karein.

---

## API Endpoints (naye)

```
GET    /api/cart                          → current cart (guest or user)
POST   /api/cart/items                    → { productId, variantId?, quantity? }
PUT    /api/cart/items/:itemId            → { quantity }
DELETE /api/cart/items/:itemId
DELETE /api/cart                          → clear cart
POST   /api/cart/merge                    → merge guest cart into logged-in user's cart

GET    /api/wishlist                      → user's wishlist (requires login)
POST   /api/wishlist                      → { productId }
DELETE /api/wishlist/:productId
POST   /api/wishlist/:productId/move-to-cart  → { variantId?, quantity? }
```

---

## Frontend — kya add hua

```
frontend/lib/api/cart.js
frontend/lib/api/wishlist.js
frontend/store/cartStore.js        (Zustand — global cart state)
frontend/store/wishlistStore.js    (Zustand — global wishlist state)
frontend/components/AddToCartButton.jsx
frontend/components/WishlistButton.jsx
frontend/app/[locale]/(shop)/cart/page.jsx
frontend/app/[locale]/(shop)/wishlist/page.jsx
frontend/messages/cart-wishlist.en.json
frontend/messages/cart-wishlist.ar.json
```

Translation files ko apni `messages/en.json` / `messages/ar.json` mein
merge kar dein (jaisa Phase 3 mein bataya tha).

### `lib/axios.js` mein ek cheez zaroor add karein

Guest cart cookie (`guest_cart_token`) ke liye credentials bhejna zaroori
hai:

```js
const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // <-- ye line add karein
});
```

### Phase 3 files mein 2 chhoti tabdeeliyan

1. **Product detail page** (`products/[slug]/page.jsx`) — static "Add to
   Cart" `<button>` ko replace karein:

   ```jsx
   import AddToCartButton from '@/components/AddToCartButton';
   // ...
   <AddToCartButton productId={product.id} variantId={selectedVariant?.id} inStock={inStock} />
   ```

2. **ProductCard.jsx** — top-end corner mein wishlist heart add kar sakte
   hain (optional):

   ```jsx
   import WishlistButton from '@/components/WishlistButton';
   // image wrapper ke andar:
   <WishlistButton productId={product.id} className="absolute top-2 end-2" />
   ```

### Header/Navbar mein cart badge

```jsx
import { useCartStore } from '@/store/cartStore';
const itemCount = useCartStore((s) => s.itemCount);
// <span>{itemCount}</span> Cart icon ke sath
```

App load par ek jagah (root layout ya header) `useCartStore.getState().loadCart()`
call kar dein taake badge shuru se hi sahi count dikhaye.

---

## Jo abhi tak nahi kiya (agle phases par depend karta hai)

- **Checkout page/flow** — Phase 6. Cart page ka "Proceed to Checkout"
  button `/checkout` route par le jata hai jo abhi exist nahi karta.
- **Delivery/shipping charge calculation** — Phase 5 (Location) + Phase 6
  (Checkout) mein aayega; abhi cart sirf product subtotal dikhata hai.
- **Coupon discount on cart** — Phase 6 mein checkout ke sath aayega.

---

## Quick test (backend)

```bash
# guest cart - add item (no auth header needed)
curl -c cookies.txt -X POST http://localhost:5000/api/cart/items \
  -H "Content-Type: application/json" \
  -d '{"productId":"<product-uuid>","quantity":2}'

# view guest cart (reuse the same cookie jar)
curl -b cookies.txt http://localhost:5000/api/cart
```

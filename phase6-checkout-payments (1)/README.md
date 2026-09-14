# Phase 6 — Checkout & Payments (Deliverable)

## ⚠️ Sabse zaroori cheez: webhook route ki mounting order

Stripe webhook signature verification **raw request body** par depend
karta hai. Agar `express.json()` pehle chal gaya, signature hamesha fail
hogi. Isliye webhook route ko app.js mein **global JSON parser se pehle**
mount karna zaroori hai:

```js
// app.js

// 1) Webhook route FIRST — raw body parser is scoped inside webhook.routes.js itself
const webhookRoutes = require('./routes/webhook.routes');
app.use('/api/webhooks', webhookRoutes);

// 2) THEN the global JSON parser for everything else
app.use(express.json());
app.use(cookieParser());

// 3) Other routes as normal
app.use('/api/checkout', require('./routes/checkout.routes'));
app.use('/api/coupons', require('./routes/coupon.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/users/addresses', require('./routes/address.routes')); // from Phase 5
```

Agar `express.json()` already globally sabse upar laga hua hai (jo aksar
hota hai), to sirf itna karein — order routes ke beech mein webhook route
alag se, bina JSON parser guzre, mount kar dein; Express route-specific
body parsers ko global parser override kar leta hai jab tak webhook route
JSON parser se pehle register ho.

---

## Backend — kya add hua

```
backend/src/models/order.model.js
backend/src/models/orderItem.model.js
backend/src/models/coupon.model.js
backend/src/models/couponUsage.model.js
backend/src/controllers/checkout.controller.js
backend/src/controllers/webhook.controller.js   (⚠️ security-critical — order sirf yahan se PAID hota hai)
backend/src/controllers/coupon.controller.js
backend/src/controllers/order.controller.js
backend/src/routes/checkout.routes.js
backend/src/routes/webhook.routes.js
backend/src/routes/coupon.routes.js
backend/src/routes/order.routes.js
backend/src/validators/checkout.validator.js
backend/src/services/stripe.service.js
backend/src/services/order.service.js           (totals calc, coupon validation, transactional order creation)
```

### Naya package

```bash
npm install stripe
```

### `.env`

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Stripe Dashboard setup

1. **Test mode** mein `sk_test_...` secret key le lein (Developers → API keys).
2. Local testing ke liye Stripe CLI use karein (production webhook URL
   deploy hone tak):
   ```bash
   stripe listen --forward-to localhost:5000/api/webhooks/stripe
   ```
   Ye command aapko `whsec_...` deta hai — wahi `STRIPE_WEBHOOK_SECRET`
   mein daalein.
3. Production mein: Dashboard → Developers → Webhooks → Add endpoint →
   `https://yourdomain.com/api/webhooks/stripe`, events select karein:
   `payment_intent.succeeded`, `payment_intent.payment_failed`,
   `payment_intent.canceled`.

---

## Payment flow (jaisa plan mein tha, ab implemented)

```
Frontend → POST /api/checkout/create-payment-intent
Backend  → Order create karta hai (PENDING, stock reserve), Stripe PaymentIntent banata hai
Frontend → Stripe.js se payment confirm karta hai (client secret)
Stripe   → webhook (payment_intent.succeeded) → Backend
Backend  → signature verify → Order.paymentStatus = PAID, status = PROCESSING
```

⚠️ Jaisa plan mein likha tha: **order kabhi bhi frontend ke "success"
callback par paid mark nahi hota** — `webhook.controller.js` hi sirf yeh
karta hai, signature-verified event ke baad.

### Stock reservation

Order create hote hi (payment se pehle) stock decrement ho jata hai, taake
do log same last-piece na khareed sakein jab dono checkout kar rahe hon.
Agar payment fail/cancel ho, `payment_intent.payment_failed` /
`.canceled` webhook stock wapis kar deta hai (`releaseOrderReservation`
service function). COD orders ke liye stock turant reserve hota hai kyunke
wahan payment gateway involved nahi hai.

---

## API Endpoints (naye)

```
GET    /api/checkout/summary?addressId=&couponCode=   → price breakdown preview
POST   /api/checkout/create-payment-intent             → { addressId, couponCode? } → { clientSecret }
POST   /api/checkout/place-order                       → { addressId, couponCode? } (COD)

POST   /api/coupons/validate                           → { code, subtotal } (login required)
GET    /api/coupons                                    → admin: list
POST   /api/coupons                                    → admin: create
PUT    /api/coupons/:id                                → admin: update
DELETE /api/coupons/:id                                → admin: soft delete

GET    /api/orders                                     → my orders, paginated
GET    /api/orders/:id                                 → single order
GET    /api/orders/by-number/:orderNumber              → for the success page

POST   /api/webhooks/stripe                            → Stripe webhook (not called by frontend directly)
```

---

## Frontend — kya add hua

```
frontend/lib/api/checkout.js
frontend/lib/api/orders.js
frontend/components/StripeProvider.jsx
frontend/components/StripePaymentForm.jsx
frontend/components/CouponInput.jsx
frontend/app/[locale]/(shop)/checkout/page.jsx           (3-step: address → review+coupon → payment)
frontend/app/[locale]/(shop)/checkout/success/page.jsx   (polls order status — webhook is async)
frontend/app/[locale]/(shop)/orders/page.jsx
frontend/app/[locale]/(shop)/orders/[id]/page.jsx
frontend/messages/checkout-orders.en.json
frontend/messages/checkout-orders.ar.json
```

### Naye packages

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### `.env.local`

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Depends on Phase 4 & 5 (already delivered)

- `useCartStore` (Phase 4) — checkout page calls `loadCart()` after a COD
  order to refresh the (now-empty) cart badge.
- `getAddresses` (Phase 5's `lib/api/address.js`) — checkout's address
  step reuses it as-is.

---

## Jo abhi tak nahi kiya (Phase 7 mein aayega)

- **Order cancellation** — `order.controller.js` mein comment chhoda hai
  jahan Phase 7 `cancelOrder` add karega (stock release + refund trigger
  agar already paid).
- **Order status history / tracking timeline** — abhi sirf current
  `status` field dikhta hai, step-by-step timeline nahi.
- **Return/refund request flow** — `Return` model Phase 7 mein banega.
- **Stripe refunds** — cancellation par agar order already PAID hai to
  refund issue karna Phase 7 ka scope hai.

---

## Quick test (Stripe CLI)

```bash
# terminal 1
stripe listen --forward-to localhost:5000/api/webhooks/stripe

# terminal 2 - trigger a fake successful payment event against a real PaymentIntent
stripe trigger payment_intent.succeeded
```

Card number for manual testing in Stripe's test mode: `4242 4242 4242 4242`,
any future expiry, any CVC.

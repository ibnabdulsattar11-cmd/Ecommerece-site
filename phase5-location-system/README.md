# Phase 5 — Location System (Deliverable)

Provider: **Leaflet + OpenStreetMap / Nominatim** (free, no API key).

## Backend — kya add hua

```
backend/src/services/geocoding.service.js       (Nominatim: reverse-geocode + search)
backend/src/services/deliveryZone.service.js    (zone matching + shipping charge logic)
backend/src/controllers/location.controller.js
backend/src/routes/location.routes.js
backend/src/validators/location.validator.js
backend/src/middlewares/geoRateLimit.middleware.js  (protects the free Nominatim upstream)
```

Ye sab Phase 1's `Address` (latitude/longitude already present) aur
`DeliveryZone` models ko directly use karte hain — koi naya model ya
migration nahi chahiye.

### `app.js` mein mount karein

```js
const locationRoutes = require("./routes/location.routes");
app.use("/api/location", locationRoutes);
```

(Foundation ke `app.js` mein ye line already commented pari hai — bas
uncomment kar dein aur import add kar dein.)

### `.env` mein add karein

```
# Nominatim usage policy requires a descriptive User-Agent with contact info
NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
NOMINATIM_USER_AGENT=your-store-name/1.0 (your-email@example.com)
```

### Naya package

Koi naya npm package **nahi** chahiye — `geocoding.service.js` Node's
built-in global `fetch` use karta hai (Node 18+ required, jo already project
ka baseline hai).

### Zaroori: Nominatim rate limit

Free public Nominatim ~1 request/second allow karta hai. Service khud hi
requests ko throttle karti hai (1.1s gap), aur `geoLimiter` middleware
ek user ko search box mein fast type/map drag karne par upstream ko flood
karne se rokta hai. Agar app scale kare (real traffic), is service ko
paid provider (LocationIQ / Mapbox / Google Geocoding) se replace kar dein —
sirf `geocoding.service.js` ke andar ka fetch call badalna hoga, baqi sab
same rahega.

---

## API Endpoints (naye)

```
GET    /api/location/reverse-geocode?lat=&lng=&locale=   → lat/lng se address
GET    /api/location/search?q=&limit=&locale=            → address autocomplete
POST   /api/location/delivery-check                      → { city, area? } ya { latitude, longitude }
GET    /api/location/cities                               → supported cities/areas list

# Admin (delivery zones) — protect + restrictTo("ADMIN")
GET    /api/location/admin/zones
POST   /api/location/admin/zones      { country, city, area?, shippingCharge, isAvailable?, estimatedDeliveryDays? }
PATCH  /api/location/admin/zones/:id
DELETE /api/location/admin/zones/:id
```

Zone CRUD abhi yahan add ki gayi hai kyunke warna delivery-check test karne
ke liye table mein koi data hi nahi hoga. Phase 9 (Admin Panel) mein isay
proper UI mil jayegi — endpoints wahi reuse ho jayenge.

### Quick test (backend)

```bash
# Admin: add a delivery zone (whole-city coverage, area = null)
curl -X POST http://localhost:5000/api/location/admin/zones \
  -H "Authorization: Bearer <admin-access-token>" \
  -H "Content-Type: application/json" \
  -d '{"country":"Pakistan","city":"Karachi","shippingCharge":200,"estimatedDeliveryDays":2}'

# Public: check delivery for a city
curl -X POST http://localhost:5000/api/location/delivery-check \
  -H "Content-Type: application/json" \
  -d '{"city":"Karachi","area":"Clifton"}'

# Public: reverse geocode
curl "http://localhost:5000/api/location/reverse-geocode?lat=24.8607&lng=67.0011"
```

---

## Frontend — kya add hua

```
frontend/lib/api/location.js
frontend/store/deliveryStore.js                      (Zustand — reused in Phase 6 checkout)
frontend/components/location/MapPickerInner.jsx      (actual Leaflet map)
frontend/components/location/MapPicker.jsx           (SSR-safe wrapper, use this one)
frontend/components/location/AddressSearch.jsx        (debounced search + dropdown)
frontend/components/location/DeliveryZoneStatus.jsx   (availability + shipping badge)
frontend/components/location/LocationPicker.jsx        (combines all of the above)
frontend/messages/location.en.json
frontend/messages/location.ar.json
```

`location.en.json` / `location.ar.json` ke `"location": {...}` block ko
apni `messages/en.json` / `messages/ar.json` mein merge kar dein.

### Naye packages

```bash
npm install leaflet react-leaflet
```

(`react-leaflet@^4.2.1` React 18 ke sath compatible hai — same version jo
project already use kar raha hai.)

### `account/page.js` (address form) mein tabdeeli

Manual `country/city/area/street` text inputs ki jagah `LocationPicker`
use karein — user map pin drag kare, search kare, ya "use my location"
dabaye, aur form fields khud-ba-khud fill ho jayen:

```jsx
import LocationPicker from "@/components/location/LocationPicker";

// form ke andar, houseNo/postalCode/label inputs ke sath:
const [resolvedAddress, setResolvedAddress] = useState(null);

<LocationPicker onChange={setResolvedAddress} />

// onAddAddress mein, values ke sath resolvedAddress bhi merge karein:
const onAddAddress = async (values) => {
  await api.post("/users/me/addresses", {
    ...values,
    country: resolvedAddress?.country,
    city: resolvedAddress?.city,
    area: resolvedAddress?.area,
    street: resolvedAddress?.street,
    latitude: resolvedAddress?.latitude,
    longitude: resolvedAddress?.longitude,
  });
  reset();
  setShowForm(false);
  loadAddresses();
};
```

`houseNo`, `postalCode`, aur `label` (Home/Office/Other) manual inputs
rehnay dein — geocoding se ye reliably nahi milte.

### Cart/Checkout mein shipping estimate (Phase 6 ke liye ready)

`useDeliveryStore` already Phase 6 checkout ke liye wired hai:

```jsx
import { useDeliveryStore } from "@/store/deliveryStore";

const { deliveryInfo, setSelectedAddress } = useDeliveryStore();
// jab user address select kare (saved address ya naya):
setSelectedAddress(selectedAddress);
// deliveryInfo.shippingCharge / .estimatedDeliveryDays checkout total mein use karein
```

---

## Jo abhi tak nahi kiya (agle phases par depend karta hai)

- **Checkout mein shipping charge ko order total mein add karna** — Phase 6.
- **Admin panel UI** for delivery zones — Phase 9 (abhi sirf API hai, Postman/curl se test karein).
- **Address form validation ko `latitude`/`longitude` required banana** — abhi optional hai kyunke purane addresses (bina geocode ke) bhi valid rehne chahiye.

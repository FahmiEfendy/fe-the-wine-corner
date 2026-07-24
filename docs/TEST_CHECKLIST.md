# The Wine Corner — Frontend Test Checklist

Run through this checklist after every deployment or significant code change.

---

## 1. Pre-Deployment

- [ ] **Container is built and pushed to GHCR**
  ```bash
  docker pull ghcr.io/fahmiefendy/fe-the-wine-corner:latest
  ```
  **Expected:** Image pulls successfully

- [ ] **Container starts without errors**
  ```bash
  docker compose up -d twc-fe
  docker logs twc-fe --tail 20
  ```
  **Expected:** No errors, Nginx starts successfully

- [ ] **Container is on the proxy network**
  ```bash
  docker network inspect proxy --format '{{range .Containers}}{{.Name}} {{end}}' | grep twc-fe
  ```
  **Expected:** `twc-fe` appears in the list

---

## 2. Page Loading & Routing

- [ ] **Homepage loads**
  ```bash
  curl -s -o /dev/null -w "%{http_code}" http://wine.fahmiefendy.dev/
  ```
  **Expected:** `200`

- [ ] **HTML contains React root element**
  ```bash
  curl -s http://wine.fahmiefendy.dev/ | grep -o 'id="root"'
  ```
  **Expected:** `id="root"`

- [ ] **Static assets load (JS bundles)**
  ```bash
  curl -s http://wine.fahmiefendy.dev/ | grep -oP '/assets/[^"]+\.js' | head -1 | xargs -I{} curl -s -o /dev/null -w "%{http_code}" http://wine.fahmiefendy.dev{}
  ```
  **Expected:** `200`

- [ ] **SPA routing works (deep link doesn't 404)**
  ```bash
  curl -s -o /dev/null -w "%{http_code}" http://wine.fahmiefendy.dev/products
  ```
  **Expected:** `200` (returns index.html for client-side routing)

- [ ] **Unknown route falls back to 404 page** *(not a blank page or SPA error)*
  ```bash
  curl -s -o /dev/null -w "%{http_code}" http://wine.fahmiefendy.dev/some/random/path
  ```
  **Expected:** `200` (SPA handles routing, `NotFound` component renders)

- [ ] **NotFound page renders correctly** — Navigate to `wine.fahmiefendy.dev/this-does-not-exist` in a browser
  **Expected:** Branded 404 page with Wine icon and "Back to Home" button

---

## 4. SEO & Meta Tags

> Use a browser and inspect page source, or use `curl -s http://wine.fahmiefendy.dev/ | grep -i og:title`.

- [ ] **Homepage has correct `<title>`** — Should be `The Wine Corner — Exquisite Wines for Every Moment`
- [ ] **Product detail page has product-specific `<title>`** — Should be `<Product Name> | The Wine Corner`
- [ ] **Open Graph tags present on homepage**
  ```bash
  curl -s http://wine.fahmiefendy.dev/ | grep -E 'og:title|og:description|og:image'
  ```
  **Expected:** Three `<meta property="og:…">` tags
- [ ] **Admin pages have `noindex` meta tag**
  ```bash
  # In browser, navigate to /admin/login and check page source for:
  # <meta name="robots" content="noindex, nofollow" />
  ```
  **Expected:** Present on `/admin/login` and `/admin`

---

## 3. API Proxy

- [ ] **API proxy passes requests to backend**
  ```bash
  curl -s http://wine.fahmiefendy.dev/api/health | jq .
  ```
  **Expected:** `{ "status": "UP", "database": "connected", ... }`

- [ ] **Product listing via proxy**
  ```bash
  curl -s http://wine.fahmiefendy.dev/api/products | jq '. | length'
  ```
  **Expected:** Number of products (or `0` if none exist yet)

- [ ] **Category listing via proxy**
  ```bash
  curl -s http://wine.fahmiefendy.dev/api/categories | jq '. | length'
  ```
  **Expected:** Number of categories (or `0` if none exist yet)

---

## 4. Image Proxy

- [ ] **Product images are served via proxy**
  ```bash
  # Replace <image-filename> with an actual uploaded image
  curl -s -o /dev/null -w "%{http_code}" http://wine.fahmiefendy.dev/uploads/images/<image-filename>
  ```
  **Expected:** `200` with image content

---

## 5. Visual / Browser Testing

> Open `wine.fahmiefendy.dev` in a browser for these checks.

- [ ] **Homepage renders correctly** — Product catalog or landing page displays without errors
- [ ] **Navigation works** — All links navigate to correct pages without full page reloads
- [ ] **Product listing page** — Products display with images, names, and prices
- [ ] **Product detail page** — Clicking a product shows full details with image
- [ ] **Category filtering** — Selecting a category filters products correctly
- [ ] **Responsive design** — Layout adapts properly on mobile, tablet, and desktop viewports
- [ ] **Animations** — Framer Motion transitions render smoothly (no janky movements)
- [ ] **No console errors** — Browser developer console shows no JavaScript errors

---

## 6. Admin Panel

- [ ] **Admin login page loads** — Login form renders correctly
- [ ] **Login with valid credentials** — Successfully authenticates and redirects to admin dashboard
- [ ] **Login with invalid credentials** — Shows error message, stays on login page
- [ ] **Create product** — Form with image upload works, product appears in catalog; success toast shown
- [ ] **Edit product** — Existing product data loads in form, saves changes; success toast shown
- [ ] **Delete product** — Product is removed from catalog after confirmation; success toast shown
- [ ] **Create category** — New category appears in category list
- [ ] **Edit category** — Category updates are reflected
- [ ] **Delete category** — Category is removed (products with this category handle gracefully)
- [ ] **Logout** — Session is cleared, redirects to login page
- [ ] **Session expiry** — Expire the JWT token manually; next API call shows a "session expired" toast and redirects to login
- [ ] **Form validation** — Submit the product form with empty fields; expect field-level error messages (no alert dialog)
- [ ] **Refresh skeletons** — Click the refresh button; expect skeleton rows in the product table before data loads

---

## 7. Image Optimization

> Open any product page and inspect network requests in browser DevTools.

- [ ] **LazyImage blur-up animation** — Product images initially render blurred and sharpen once the hi-res version loads
- [ ] **Images lazy-load on scroll** — Network tab shows images for off-screen products not fetched until scrolled into view
- [ ] **ProductGallery desktop hover zoom** — On a product detail page, hover over the main image; a magnified overlay should appear
- [ ] **ProductGallery lightbox** — Click the main image; a full-screen lightbox opens with zoom in/out and close controls
- [ ] **ProductGallery keyboard navigation** — With lightbox open, press `ArrowLeft`, `ArrowRight`, `Escape` keys
  **Expected:** Navigate between views; `Escape` closes the lightbox
- [ ] **ProductGallery mobile swipe** — On a mobile device, swipe left/right in the lightbox to navigate; swipe down to close
- [ ] **Optimized image served with `?w=` param**
  ```bash
  curl -s -I "http://wine.fahmiefendy.dev/uploads/<image-filename>?w=400" | grep -i content-type
  ```
  **Expected:** `image/webp` or correct image content type

---

## 8. Rollback

- [ ] **Previous image can be restored**
  ```bash
  docker compose pull twc-fe
  docker compose up -d twc-fe
  docker logs twc-fe --tail 10
  ```
  **Expected:** Container starts with previous version, pages load correctly

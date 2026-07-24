# The Wine Corner — Frontend Changelog

All notable changes to the frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [1.0.0] — 2026-07-24

### Added
- `LazyImage` component with `IntersectionObserver`, `srcSet`/`sizes`, and progressive blur-up reveal animation
- `ProductGallery` component with three pseudo-views (Bottle View, Label Detail, Premium Display), desktop hover zoom, lightbox with zoom/pan controls, keyboard arrow navigation, and mobile swipe-to-dismiss gestures
- `Seo` component (`src/components/Seo.jsx`) — renders `<title>`, meta description, Open Graph, and Twitter Card tags via `react-helmet-async` on all pages
- `NotFound` page (`src/pages/NotFound.jsx`) — reusable 404 UI with configurable `title` and `message` props; used for unknown routes, missing products, and missing categories
- `ErrorBoundary` component (`src/components/ErrorBoundary.jsx`) — class-based React error boundary wrapping the entire app tree
- `Toaster` from `react-hot-toast` mounted in `App.jsx` — global toast notification system
- `AuthExpiryHandler` component in `App.jsx` — listens for `auth:expired` custom DOM event and navigates to `/admin/login`
- `sessionExpiredNotified` debounce flag in `api.js` — prevents duplicate session-expired toasts
- `validateProductForm()` function in `AdminDashboard.jsx` — client-side form validation with field-level errors and `input-error` CSS class
- Admin product table skeleton rows shown during `isRefreshing` state
- `noIndex` prop on Admin Login and Admin Dashboard `<Seo>` instances
- `HelmetProvider` wrapping in `main.jsx`
- Wildcard `<Route path="*">` in `App.jsx` for unmatched routes

### Changed
- `ProductDetail` page now uses `ProductGallery` instead of a raw `<img>` tag
- `Home`, `Category`, `Explore`, `Search`, and `AdminDashboard` pages now use `LazyImage` for all product images
- `ProductGallery` keyboard handler stabilized with `useCallback` to eliminate stale closure lint warning
- `galleryItems` memoized with `useMemo` to prevent unnecessary re-renders
- Lightbox pan offset now uses `info.offset` (relative drag delta) instead of `info.point` (absolute screen coordinates)
- Mouse-move zoom throttled with `requestAnimationFrame` to reduce re-render frequency
- `api.js` 401 interceptor: no longer hard-redirects; fires `auth:expired` event and shows a toast instead
- `AdminDashboard` replace `alert()` calls with `toast.error()` / `toast.success()`
- `ProductDetail` not-found state uses `<NotFound>` component instead of inline `<div>`
- `Category` not-found state uses `<NotFound>` component instead of inline `<div>`
- `AdminLogin`, `AdminDashboard`, `Category`, `Explore`, `Home`, `ProductDetail`, `Search` pages all include `<Seo>` tags
- Product image URL for OpenGraph computed from `VITE_API_BASE_URL` in `ProductDetail`


## [0.1.0] — 2026-06-19

### Added
- React 19 + Vite 8 single-page application
- Product catalog with category-based browsing
- Individual product detail pages with view tracking
- Admin panel with JWT-based login
- Product CRUD management in admin (create, edit, delete with image upload)
- Category CRUD management in admin
- Client-side routing via React Router v7
- API integration via Axios with `/api/` proxy prefix
- Animated UI transitions using Framer Motion
- Icon set via Lucide React
- Multi-stage Dockerfile — Vite build → Nginx (stable-alpine) serving
- Internal Nginx config for SPA routing, API proxy (`/api/` → `twc-be:5001`), and static asset serving
- GitHub Actions CI/CD pipeline — builds with `VITE_API_BASE_URL` build arg and pushes to GHCR
- `.dockerignore` to optimize image size

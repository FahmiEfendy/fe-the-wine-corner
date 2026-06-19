# The Wine Corner — Frontend TODO

## 🔴 Critical

- [ ] **SEO meta tags** — Add proper `<title>`, `<meta description>`, and Open Graph tags per page for social sharing
- [ ] **Error boundaries** — Add React error boundary components to prevent white-screen crashes
- [ ] **Loading states** — Add skeleton loaders or spinners for async data fetching
- [ ] **404 page** — Create a user-friendly "page not found" component for unknown routes
- [ ] **Form validation** — Client-side validation on admin forms before submission (required fields, file type checks)
- [ ] **Auth token refresh** — Handle JWT expiry gracefully (redirect to login, show message)

## 🟡 Medium

- [ ] **Image lazy loading** — Defer off-screen product images with `loading="lazy"` or Intersection Observer
- [ ] **Image optimization** — Serve WebP format and multiple sizes for product images
- [ ] **Accessibility audit** — Run axe/Lighthouse audit, fix ARIA labels, keyboard navigation, and color contrast issues
- [ ] **PWA support** — Add `manifest.json` and service worker for offline access and "Add to Home Screen"
- [ ] **Toast notifications** — Replace `alert()` with a toast/notification system for success/error feedback
- [ ] **Responsive image gallery** — Zoomable product images with touch gestures on mobile
- [ ] **Search functionality** — Add product search bar with debounced API queries
- [ ] **Price formatting** — Format prices with locale-aware currency (e.g., Rp 250.000)
- [ ] **Pagination / infinite scroll** — Handle large product catalogs without loading everything at once

## 🟢 Nice to Have

- [ ] **Unit tests** — Add Vitest tests for key components and utility functions
- [ ] **E2E tests** — Add Playwright or Cypress tests for critical user flows (browse, admin CRUD)
- [ ] **CI test pipeline** — Run tests in GitHub Actions before building the Docker image
- [ ] **Analytics** — Integrate Google Analytics or Plausible for page view and click tracking
- [ ] **Dark mode** — Add a theme toggle with system preference detection
- [ ] **i18n** — Internationalization support for multi-language content
- [ ] **Performance monitoring** — Add Web Vitals tracking (LCP, FID, CLS)
- [ ] **Storybook** — Component library documentation for development
- [ ] **Sitemap generation** — Auto-generate `sitemap.xml` for search engine crawlers

# The Wine Corner — Frontend TODO

## 🔴 Critical


## 🟡 Medium

- [ ] **OG image for OpenGraph** — Place a static `og-image.png` in `public/` and set `VITE_OG_IMAGE` in GitHub Actions build args. The current `DEFAULT_IMAGE` in `Seo.jsx` points to a placeholder URL that needs this file at build time
- [ ] **Canonical URL query strings** — `Seo.jsx` uses `window.location.href` as the canonical, which includes query strings on Search and filtered Category pages. Use `window.location.origin + window.location.pathname` to emit clean canonical URLs
- [ ] **Bundle size** — Main JS chunk is 504 kB (gzipped 164 kB). Use dynamic `import()` to code-split `AdminDashboard`, `ProductGallery`, and `framer-motion` to reduce initial load
- [ ] **Accessibility audit** — Run axe/Lighthouse audit, fix ARIA labels, keyboard navigation, and color contrast issues
- [ ] **PWA support** — Add `manifest.json` and service worker for offline access and "Add to Home Screen"

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
- [ ] **`getImageUrl()` utility** — Extract shared image URL construction logic from `ProductDetail.jsx` and `ProductGallery.jsx` into a reusable `utils/image.js` helper

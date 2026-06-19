# The Wine Corner — Frontend Changelog

All notable changes to the frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [1.0.0] — 2026-06-19

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

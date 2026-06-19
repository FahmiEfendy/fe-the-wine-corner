# The Wine Corner — Frontend

## Overview

React single-page application for The Wine Corner, a wine product catalog storefront. Built with Vite and served via Nginx in production. Handles client-side routing, API proxy to the backend, and product image serving.

**Container name:** `twc-fe`
**Image:** `ghcr.io/fahmiefendy/fe-the-wine-corner:latest`
**Port:** `80` (internal Nginx)
**Runtime:** Nginx stable-alpine (serving static build)
**Public URL:** `wine.fahmiefendy.dev`

## Architecture

```
Browser → Cloudflare → infra-nginx → twc-fe:80 (Nginx)
                                       ├── /            → Static SPA (index.html)
                                       ├── /assets/     → Vite-built JS/CSS bundles
                                       ├── /api/*       → Proxy to twc-be:5001
                                       └── /uploads/*   → Proxy to twc-be:5001 (images)
```

The frontend container runs its own internal Nginx that:
1. Serves the Vite-built static files
2. Proxies `/api/*` requests to the backend container (`twc-be:5001`)
3. Proxies `/uploads/images/*` to serve product images from the backend
4. Handles SPA fallback routing (all paths → `index.html`)

## Directory Structure

```
fe-the-wine-corner/
├── index.html            # HTML entry point
├── vite.config.js        # Vite build configuration
├── nginx.conf            # Internal Nginx config (SPA routing + API proxy)
├── src/                  # React application source
├── docs/                 # Documentation
├── Dockerfile            # Multi-stage build (Vite → Nginx)
└── .github/workflows/
    └── deploy.yml        # CI/CD — build & push to GHCR
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API URL (build-time, baked into JS bundle) | `http://localhost:5001` | Yes |

> **Note:** This variable is set at build time via Docker build arg. It's embedded into the JavaScript bundle during `vite build`. For the Docker deployment, this is configured as a GitHub Actions secret.

## Local Development

```bash
# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env to set VITE_API_BASE_URL to your local backend URL

# Start development server (hot reload on port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Docker Deployment

The container is built and pushed via GitHub Actions on every push to `main`. The `VITE_API_BASE_URL` is injected at build time via the `--build-arg` flag.

On the homeserver:

```bash
# Start the app stack
cd /path/to/homeserver/apps/thewinecorner
docker compose up -d

# View logs
docker logs twc-fe --tail 50 -f

# Check the frontend is serving
curl -s -o /dev/null -w "%{http_code}" http://wine.fahmiefendy.dev/
```

## Internal Nginx Configuration

The frontend container runs its own Nginx instance with the following routing:

| Path | Handler | Description |
|------|---------|-------------|
| `/` | `try_files` → `index.html` | SPA fallback for client-side routing |
| `/assets/` | `try_files` → 404 | Vite-built static assets |
| `/api/*` | `proxy_pass` → `twc-be:5001` | API proxy (strips `/api` prefix) |
| `/uploads/images/*` | `proxy_pass` → `twc-be:5001` | Product image proxy |

> **Note:** `absolute_redirect off` is set to prevent Nginx from inserting `localhost` into redirects when running behind Cloudflare Tunnel.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Blank page | Check browser console for JS errors. Verify `VITE_API_BASE_URL` was set correctly at build time |
| API calls failing | Verify `twc-be` is running and on the same Docker network (`twc-internal`) |
| Product images not loading | Check `/uploads/images/` proxy — verify backend has the image files in its uploads volume |
| 404 on page refresh | Verify `nginx.conf` has `try_files $uri $uri/ /index.html` for SPA routing |
| 502 from infra-nginx | Check `twc-fe` is running: `docker ps --filter name=twc-fe` |
| Old content after deploy | Clear browser cache or do a hard refresh (Ctrl+Shift+R) |

## Related Files

- [docker-compose.yml](../../docker-compose.yml) — Service definition
- [Dockerfile](../Dockerfile) — Multi-stage container build
- [nginx.conf](../nginx.conf) — Internal Nginx routing config
- [deploy.yml](../.github/workflows/deploy.yml) — CI/CD pipeline
- [vite.config.js](../vite.config.js) — Build configuration

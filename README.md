# Seolith Walk In

A cross-device, single-codebase platform that lets any establishment render a realistic 3D walk-in experience from photos, connect realtime inventory & prices, and serve shoppers through voice, search, text, and AI chatbots. Built as a PWA with a public API so future robots and assistants can browse, query, and guide shopping trips.

## Branch

`foundation/walk-in-3d-platform`

## Vision

Every client and website should be able to offer a walk-in model of their physical space. Owners capture or upload photos; the platform generates a spatial, interactive, shoppable 3D scene. Users explore, ask questions, get guided routes, and see current stock/price from any device.

## Tech Stack

- **Framework:** Next.js 15 App Router (React 19, TypeScript)
- **3D Engine:** Three.js + React Three Fiber + Drei
- **Rendering:** WebGL/WebXR, PBR materials, 360° panorama + GLB mesh photogrammetry pipeline
- **State:** Zustand
- **Styling:** Tailwind CSS 4
- **PWA:** next-pWA (offline, installable, cross-device)
- **Auth:** Auth.js v5 (email/password, JWT sessions, middleware-protected routes)
- **AI/Voice:** Web Speech API + pluggable LLM providers (OpenAI, Anthropic, Google, local)
- **Standards:** glTF/GLB, USDZ, WebXR, schema.org/Product, GTIN, 3D Commerce WG guidelines
- **API:** Next.js API routes, typed with Zod, robot-ready JSON-LD

## Project Structure

```
app/                 # Next.js app routes
  owner/             # Owner dashboard (upload, hotspots, products)
  signin/            # Auth sign-in page
  signup/            # Auth sign-up page
components/          # React components
  3d/                # Three.js / R3F scenes
  auth/              # Auth forms
  ui/                # Shopper interface panels
  owner/             # Dashboard editing tools
lib/                 # Shared logic (store, inventory, telemetry, ai, scene-config, auth)
docs/                # Architecture, standards, monetization, API, research
public/              # Static assets, PWA manifest, service worker
```

## Getting Started

```bash
npm install
npm run dev
```

- Landing page: [http://localhost:3000](http://localhost:3000)
- Demo shopper experience: [http://localhost:3000/demo](http://localhost:3000/demo)
- Public storefront: [http://localhost:3000/s/:storeId](http://localhost:3000/s/:storeId)
- Owner dashboard: [http://localhost:3000/owner](http://localhost:3000/owner)
- Pricing: [http://localhost:3000/pricing](http://localhost:3000/pricing)
- Sign in: [http://localhost:3000/signin](http://localhost:3000/signin)
- Sign up: [http://localhost:3000/signup](http://localhost:3000/signup)

> **Note:** set `AUTH_SECRET` in `.env.local` before signing in. Generate one with `openssl rand -base64 32`.

### Owner dashboard workflow

1. Sign up at `/signup`, then sign in at `/signin`.
2. Create a store from the dropdown.
3. Choose your 3D source:
   - **360° panorama** — paste a URL (e.g., Poly Haven’s `decor_shop.jpg`) or upload an image.
   - **Photogrammetry** — upload a photo set and generate a GLB mesh. Use the local placeholder for quick previews or configure a cloud photogrammetry API (Polycam, KIRI Engine, custom webhook) for real reconstruction.
4. Click anywhere on the scene to place a product hotspot.
5. Fill in SKU, name, price, stock, aisle/shelf and save.
6. **Bulk import** products via CSV, or connect Shopify webhooks for live stock/price sync.
7. Visit `/s/[storeId]` to preview the public walk-in experience with your hotspots, search, AI guide, ads, and shopping list.

### Auth & multi-tenancy

- Auth.js v5 with email/password credentials and JWT sessions.
- `/owner` is protected by middleware; unauthenticated users are redirected to `/signin`.
- Each owner can create and manage multiple stores, subject to their subscription plan.
- Scene config, hotspots, inventory sources, ads, and API keys are persisted in PostgreSQL and mirrored to localStorage for offline editing.

### Inventory integrations

- **CSV upload** — owner dashboard bulk import (`sku,name,price,currency,inventoryLevel,availability,aisle,shelf`).
- **Shopify webhooks** — `POST /api/v1/stores/:id/inventory/webhooks/shopify` validates HMAC and accepts `products/update`, `products/create`, and `inventory_levels/update`.
- Aggregated inventory is merged with owner-placed hotspots; CSV/Shopify data fills price/stock while hotspots provide spatial location.

### Billing & plans

- Free: 1 store, 50 SKUs, 360° panorama.
- Pro: 5 stores, 500 SKUs, photogrammetry cloud backend, AI guide, retail media.
- Enterprise: unlimited stores/SKUs, API access, priority support.
- Stripe Checkout is enabled when `STRIPE_SECRET_KEY` and price IDs are set in `.env.local`.

### Telemetry & retail media

- Events are batched client-side and flushed to `POST /api/v1/analytics/events`.
- Configure PostHog, Segment, or GA4 via `.env.local` for production analytics.
- Owners can create sponsored placements in the Retail Media dashboard; impressions and clicks are tracked and forwarded to the telemetry provider.
- Owner analytics dashboard shows scene loads, searches, AI chats, hotspot clicks, conversions, and ad CTR.

### AI 360° scene generation

- **Skybox AI (cloud)** — set `SKYBOX_API_KEY` for paid cloud generation.
- **Local ComfyUI (free)** — set `SD_API_URL=http://127.0.0.1:8188` and install a checkpoint model:
  ```bash
  curl -L -o ComfyUI/models/checkpoints/v1-5-pruned-emaonly.safetensors \
    https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly.safetensors
  ```
- Owners can also capture real spaces with the free Google Street View app and upload the photo.

## Key Documents

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system design, data flow, security, performance
- [`docs/STANDARDS.md`](docs/STANDARDS.md) — 3D/interoperability standards and portability strategy
- [`docs/MONETIZATION.md`](docs/MONETIZATION.md) — revenue model, advertising, telemetry
- [`docs/API.md`](docs/API.md) — public API and robot integration path

## Deployment

### Docker

Build and run locally:

```bash
docker build -t walk-in .
docker run -p 3000:3000 \
  -e AUTH_SECRET=your-secret \
  -e NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  walk-in
```

Or with docker-compose:

```bash
docker compose up --build
```

### Infrastructure

- **PostgreSQL** — primary database for stores, scenes, products, ads, API keys, and telemetry.
- **Redis** — rate limiting, caching, and the BullMQ photogrammetry job queue.
- **S3** — storage for 3D assets (GLB meshes, panoramas, photos).
- **BullMQ worker** — background photogrammetry processing (`npm run worker:photogrammetry`).

### Production hardening

The production image uses a distroless Node.js runtime and runs with:
- Non-root user
- Read-only root filesystem
- `no-new-privileges`
- All Linux capabilities dropped
- `/tmp` mounted as tmpfs

Use `docker-compose.prod.yml` to mirror these settings locally:

```bash
docker compose -f docker-compose.prod.yml up --build
```

### EC2 via GitHub Actions

The workflow in `.github/workflows/deploy.yml` runs tests, builds a Docker image, scans it with Trivy, pushes it to Docker Hub, and deploys to EC2 over SSH with hardened runtime flags.

Required GitHub secrets:

- `DOCKER_USERNAME` / `DOCKER_PASSWORD` — Docker Hub credentials.
- `EC2_HOST` / `EC2_USERNAME` / `EC2_SSH_KEY` / `EC2_PORT` — EC2 connection details.
- `AUTH_SECRET` — Auth.js session secret.
- `NEXT_PUBLIC_APP_URL` — public URL of the deployment.
- Optional: `OPENAI_API_KEY`, `TELEMETRY_PROVIDER`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.

On the EC2 instance, ensure Docker is installed and the SSH user can run `docker` commands. The app listens on port 3000 behind your reverse proxy (Nginx, ALB, etc.).

## License

Private / All rights reserved.

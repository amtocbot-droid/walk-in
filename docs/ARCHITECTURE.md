# Architecture

## High-Level Design

Walk In is a PWA-first, single-codebase application that runs on mobile, tablet, desktop, and XR devices. The same React/Next.js code renders the 3D scene (panorama or mesh), the owner dashboard, the shopper interface, and the public API.

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (PWA / Browser)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  3D Viewer  │  │  Search/AI  │  │  Voice + Text Input │  │
│  │  R3F/WebGL  │  │   Chatbot   │  │   Web Speech API    │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         └─────────────────┴────────────────────┘            │
│                          Zustand State                       │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Next.js Server                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Auth/API   │  │  Inventory  │  │  3D Asset Pipeline  │  │
│  │  Routes     │  │  Sync       │  │  (glTF/USDZ/360)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   PostgreSQL           Redis / SSE           Object Store
   (users, stores,      (realtime stock,      (photos, glb,
    products, orders)    sessions, ads)         usdz, env maps)
```

## Rendering Strategy

### MVP: 360° Panorama + Hotspots

The fastest path to "walk in" is a 360° equirectangular photo (or multiple photos) with interactive hotspots. This works on every device, loads quickly, and can be captured with any 360° camera or phone app.

### Near-term: Photogrammetry Mesh

Upload a photo set → the owner dashboard can run a local placeholder processor or send the images to a cloud photogrammetry backend. The server-side `GenericCloudBackend` posts images to a configurable upload URL, polls a status endpoint, and downloads the resulting GLB. This works with Polycam, KIRI Engine, or any webhook-style photogrammetry API. The viewer switches to the mesh when available.

### Long-term: NeRF / Gaussian Splatting

As devices and browsers support it, add neural radiance fields or 3D Gaussian splats for photorealistic novel-view synthesis.

## Performance

- **Asset streaming:** load LODs; show low-res preview first.
- **Compression:** Draco-compressed glTF, KTX2 textures, basis universal.
- **Caching:** service worker caches scene assets; Redis caches inventory.
- **Rendering:** single canvas, device-pixel-ratio clamp, frustum culling, instancing for repeated products.
- **Edge:** deploy to CDN/edge for low-latency asset delivery.

## Security

- Auth via Auth.js with role-based access (owner, shopper, robot).
- Owner dashboard uses session cookies; store-scoped API routes use per-store API keys validated against `lib/db`.
- All API inputs validated with Zod.
- HTTPS-only, CSP headers, secure cookies.
- Rate limiting per API key/IP.
- PII minimized; telemetry anonymized.
- File uploads scanned and sandboxed; only image/zip archives accepted.
- Production container runs as non-root on a distroless Node.js runtime with a read-only root filesystem, no new privileges, and all capabilities dropped.
- CI pipeline scans images with Trivy and fails on HIGH/CRITICAL vulnerabilities.

## AI Guide

- A pluggable provider abstraction supports OpenAI, Anthropic, Google, and a local fallback resolver.
- OpenAI is wired to a real `OPENAI_API_KEY` and model (default `gpt-4o-mini`).
- The guide uses function calling (`find_product`, `check_stock`) against the live product catalog to ground answers in real inventory.
- Responses can be streamed as NDJSON so the shopper sees the answer word-by-word in the chat UI.
- Voice input transcripts are routed directly into the AI chat for hands-free guidance.

## Billing & Plans

- Stripe Checkout handles subscriptions; webhooks update the store's `plan` and Stripe IDs.
- Plan limits are enforced in the owner dashboard (SKU count, store count, photogrammetry, retail media).
- API keys are issued per store for robot/integration access and tracked with `lastUsedAt`.

## Telemetry & Advertising

- `trackEvent` batches events client-side and flushes to `POST /api/v1/analytics/events`.
- The server persists events in `lib/db` and forwards them to a pluggable provider: PostHog, Segment, GA4, or console (default).
- Retail media ads are managed per-store in the owner dashboard; impressions and clicks are tracked locally and mirrored via telemetry events (`ad.impression`, `ad.click`).
- Owner analytics dashboard shows scene loads, searches, AI chats, hotspot clicks, conversions, and ad CTR.

## Realtime Inventory

- Establishments expose inventory via CSV/API/webhook.
- Walk In normalizes to a canonical product schema.
- Stock updates are pushed to clients via Server-Sent Events or WebSockets.
- Price and availability are fetched at view time with short TTL caching.

## Persistence

- PostgreSQL via Prisma stores users, stores, scenes, products, ads, API keys, and telemetry events.
- Redis handles rate limiting, caching, and the BullMQ photogrammetry job queue.
- S3 stores 3D assets (GLB meshes, panoramas, photos) with presigned URLs for private access.
- The owner dashboard mirrors changes to localStorage for offline editing and syncs to the server via API routes.
- Public storefronts (`/s/[storeId]`) fetch scene and product data from the public API.

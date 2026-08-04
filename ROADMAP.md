# Roadmap

## Now (Foundation) — Complete

- [x] Git repo + feature branch `foundation/walk-in-3d-platform`
- [x] Market & standards research
- [x] Single-codebase Next.js PWA with Three.js/R3F
- [x] 360° panorama viewer with hotspots, zoom, tooltips
- [x] Realtime inventory mock + AI guide
- [x] Voice, search, text, AI chat UX
- [x] Telemetry, security helpers, advertising spot
- [x] Public API v1 for robots (scene, products, guide, analytics)

## Next (MVP) — In Progress

- [x] Owner dashboard: upload 360° photos, place hotspots, set prices/stock
- [x] Persist owner scene config locally + server-side JSON DB
- [x] CSV inventory upload in owner dashboard
- [x] Shopify webhook endpoint with HMAC verification
- [x] Authentication (Auth.js) and multi-tenant store management
- [x] Photogrammetry pipeline abstraction + placeholder GLB processor
- [x] AI provider integration (OpenAI/Anthropic/Google) with function calling
- [x] Cloud photogrammetry backend abstraction (Polycam/KIRI/custom webhook compatible)
- [x] Production analytics backend (PostHog / Segment / GA4)
- [x] Retail media dashboard: sponsored hotspots, impressions/clicks
- [x] Server-side persistence (stores, scenes, products, ads, API keys, telemetry)
- [x] Public storefront `/s/[storeId]`
- [x] Stripe billing + plan enforcement
- [x] API keys per store for robots/integrations
- [x] Owner analytics dashboard
- [x] Shopping list + conversion tracking
- [ ] Full COLMAP/Meshroom or managed photogrammetry backend deployment

## Later (Scale)

- [ ] Full photogrammetry/NeRF/Gaussian Splat rendering pipeline
- [ ] WebXR immersive mode
- [ ] Native app shell via PWA/TWA + AR Quick Look (USDZ)
- [ ] Robot API subscriptions / WebSocket stream
- [ ] Multi-tenant establishment management
- [ ] Checkout / transaction fees
- [ ] Migrate JSON DB to PostgreSQL
- [ ] Real ad marketplace with automated billing

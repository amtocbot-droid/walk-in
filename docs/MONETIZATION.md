# Monetization & Telemetry

## Recommended Revenue Strategy

**Start with SaaS subscriptions, add retail media once you have traffic, and introduce transaction fees only after checkout is proven.**

### Phase 1: SaaS Subscriptions (Primary Revenue)

This is the foundation. Establishments pay to create and host their 3D walk-in experience.

- **Predictable revenue:** monthly/annual recurring by location or active space.
- **Clear value prop:** higher engagement, better product discovery, reduced "where is it?" support.
- **Tiered packaging:**
  - **Starter** — 360° panorama, up to 500 SKUs, basic search, email support.
  - **Pro** — photogrammetry/NeRF mesh, up to 5,000 SKUs, AI guide, analytics dashboard.
  - **Enterprise** — unlimited SKUs, API access, custom integrations, SLA, dedicated support.
- **Pricing anchors:** Matterport-style per-active-space pricing gives buyers a familiar comparison. A typical range might be $49–$499/location/month depending on SKU count and fidelity.

### Phase 2: Retail Media & Advertising (High-Margin)

Once the platform has shopper traffic, add sponsored placements.

- **Sponsored hotspots** in the 3D scene (e.g., "New oat milk — 20% off").
- **Featured search results** — CPC or fixed-fee promoted products.
- **Category takeovers** — spatially anchored banners, limited per session.
- **Revenue share model:** split ad revenue with the establishment to align incentives.
- Owner dashboard includes a Retail Media manager to create ads, schedule start/end dates, link to products, and view impression/click metrics.
- Telemetry events (`ad.impression`, `ad.click`) are batched and forwarded to PostHog, Segment, or GA4 for reporting and billing.
- This mirrors Amazon Sponsored Products / Walmart Connect but inside a 3D store.

### Phase 3: Transaction Fees (Future)

Take a small percentage when shoppers complete checkout inside the experience.

- Requires payment processing, cart, fulfillment, and returns integration.
- Highest potential upside but also highest operational complexity.
- Best introduced after GMV reaches a meaningful threshold or after enabling affiliate/deep-link checkout as a lighter first step.

## Secondary Usage Revenue

- **AI overage:** conversations beyond plan quota.
- **API overage:** robot/integrations calls beyond plan quota.
- **Bandwidth/storage:** high-traffic stores or 4K/8K assets.

## Telemetry

Track only anonymized or consent-given events:

- Scene load time, frame rate, device class.
- Hotspot interactions, search queries, AI conversation intents.
- Conversion events: viewed product → added to list → guided to shelf.
- Ad impressions and clicks.

Telemetry is opt-in for shoppers, detailed for establishment owners. Data is stored in compliance with GDPR/CCPA.

## Privacy-by-Design

- Voice transcripts processed on-device where possible; server-side only when needed.
- No facial recognition or personal tracking inside the scene.
- Clear data-use notices and export/delete endpoints.

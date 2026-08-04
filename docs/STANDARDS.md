# Standards & Portability

## 3D Asset Standards

| Format | Role | Notes |
|--------|------|-------|
| **glTF 2.0 / GLB** | Primary runtime format | Khronos standard; PBR materials; Draco + KTX2 extensions for compression. |
| **USDZ** | Apple AR Quick Look | Export path for iOS AR experiences. |
| **WebXR** | VR/AR headsets | W3C standard; use for immersive walk-throughs. |
| **OpenXR** | Native VR/AR apps | Future native app path; keep abstractions device-agnostic. |
| **3D Tiles / OGC** | Large spaces / geospatial | If mapping multiple stores or malls. |

## Product & Inventory Standards

- **schema.org/Product** for structured product data.
- **GTIN** (UPC/EAN/ISBN) for universal product identification.
- **Google Merchant Center / Amazon Product feed** compatibility for ad syndication.
- **Canonical fields:** `sku`, `name`, `price`, `currency`, `availability`, `quantity`, `aisle`, `shelf`, `coordinates`.

## API Standards

- REST + JSON, typed with Zod.
- JSON-LD responses for robot/assistant consumption.
- OpenAPI/Swagger spec generated from route handlers.
- API keys with scoped permissions (read inventory, read scenes, guide shopper).
- Webhook signatures (Stripe-style HMAC) for inventory providers.

## Accessibility & Cross-Device

- Responsive PWA: installable, offline-capable, works on low-end Android and iOS.
- Voice input via Web Speech API; screen-reader labels on every hotspot.
- Keyboard navigation for desktop users.
- Reduced-motion option.

## Portability Checklist

- [ ] Scene exportable as GLB + JSON manifest.
- [ ] Inventory exportable as schema.org/Product feed.
- [ ] Embed snippet so establishments can put the 3D scene on their own website.
- [ ] API endpoints versioned (`/api/v1/...`).
- [ ] Webhook format documented and stable.

# Market & Standards Research

Research date: 2026-07-30

## Existing Platforms

| Platform | Focus | Differentiation |
|----------|-------|-----------------|
| **Matterport** | Photogrammetry scans, retail tours, floor plans | Best capture pipeline; property intelligence; freemium by active spaces |
| **Rooom** | Web virtual exhibitions & showrooms | No-code CMS, GDPR/ISO 27001, EU hosting |
| **Emersya** | 3D/AR product configurators | Strong PBR/material automation, ERP/PIM integrations, Khronos 3D Commerce WG |
| **Threekit** | AI-guided CPQ + 3D/AR configurator | Oracle/Salesforce CPQ heritage; grounded AI sales agents |
| **Sayduck** | 3D configurator + virtual photography | "Create once, use everywhere" |
| **Vertex** | CAD/PLM 3D access | Industrial pipeline relevance |
| **8th Wall** | WebAR/WebXR engine | Now open-source; works with Three.js/Babylon.js/PlayCanvas |
| **Zappar/Zapworks** | No-code AR/WebXR + affordable headset | Long track record; QR-based accessibility |
| **Shopify 3D/AR** | Product-page 3D/AR | Largest SMB reach; USDZ/glb via `<model-viewer>` |
| **Google ARCore / Geospatial** | Cross-platform AR SDK | Largest installed base; WebXR path |
| **Apple Vision Pro / ARKit** | Spatial computing / AR Quick Look | USDZ-native; high-fidelity passthrough; privacy positioning |
| **NVIDIA Omniverse / OpenUSD** | Enterprise digital twins | OpenUSD backbone; CloudXR streaming |
| **PlayCanvas / Needle Engine** | Lightweight web-first engines | Fast iteration, small bundles, PWA deploy |

Historical players **ByondXR**, **VNTANA**, and **ObsessVR** could not be verified from live sources during research. **IKEA Kreativ/Place**, **Walmart Roblox**, **Amazon Anywhere**, and **Meta Horizon Worlds** provide useful reference points but were not reachable for direct citation.

## Key Standards

- **glTF 2.0 / GLB** — primary runtime asset format ("JPEG of 3D").
- **USD / USDZ** — Apple AR Quick Look; OpenUSD governed by AOUSD.
- **WebXR / OpenXR** — browser and native XR APIs.
- **Khronos 3D Commerce Working Group** — glTF commerce guidelines, Material Variants, Asset Auditor.
- **KTX 2.0 + Basis Universal** — compressed textures inside glTF.
- **MaterialX** — rich material definitions.
- **OGC 3D Tiles** — streaming large photogrammetry/BIM.
- **schema.org/Product + Offer + GTIN** — structured product data.
- **IIIF** — high-resolution image interoperability.

## Inventory Integration Patterns

- REST/GraphQL product APIs (Shopify, Square).
- Webhooks for near-real-time sync with HMAC verification and idempotency.
- Feed formats: Google Shopping, Amazon product feeds.
- ERP/PIM/DAM/PLM connectors (SAP, NetSuite, Akeneo, Salsify).
- Accuracy tactics: single source of truth, event-driven cache invalidation, reservation on cart, location-aware stock, safety buffers.

## AI & Interaction

- Speech-to-text: Web Speech API (free), Google Cloud Speech-to-Text, OpenAI Whisper / Realtime API.
- LLM agents: GPT-4o/o-series, Claude, Gemini with function calling tied to live inventory.
- RAG/vector search for product discovery (Qdrant, Pinecone, Weaviate, Algolia AI).
- Always ground answers in live price/stock.

## Monetization & Telemetry

- SaaS per active space / SKU / location.
- Retail media: sponsored hotspots, featured placements, CPC ads.
- Transaction/revenue share and affiliate/deep-link checkout.
- 3D-specific telemetry: scene_load, hotspot_click, dwell_time_per_zone, ar_launch.
- Privacy: consent mode, on-device transcription, PII separation.

## Cross-Device Rendering

- Recommended: PWA with React + TypeScript + React Three Fiber + Three.js.
- Drop-in AR: `<model-viewer>` and WebXR.
- Asset pipeline: glTF/GLB with Draco + KTX2/BasisU; keep USDZ for iOS.
- Performance: LOD, occlusion culling, device-pixel-ratio clamp, WebGPU fallback to WebGL 2.0.
- Cloud vs edge: edge/CDN rendering for cost; cloud streaming (CloudXR/Pixel Streaming) for heavy scenes.

## Strategic Gaps & Positioning

Most competitors focus on either **photogrammetry tours** (Matterport) or **product configurators** (Threekit, Emersya). The differentiated wedge is a single-codebase app that combines:

1. A scanned/photographed establishment,
2. Real-time inventory and pricing,
3. AI voice/text guide,
4. AR try-on / walk-through,
5. Public API for robots and assistants.

Initial beachheads: independent retail, car dealerships, furniture showrooms, and mall operators.

# Public API & Robot Integration

## Authentication

Store-scoped routes accept either:
- Owner session cookie (`authjs.session-token`) from the browser.
- API key in the `Authorization: Bearer <key>` header. Keys are issued per store in the owner dashboard.

Public storefront routes (`GET /api/v1/stores/:id/scene`, `GET /api/v1/stores/:id/products`) do not require authentication.

## Endpoints

### `GET /api/v1/stores`

List stores (public summary).

```json
{
  "stores": [
    {
      "id": "store_123",
      "name": "Downtown Grocers",
      "url": "/s/store_123",
      "plan": "pro"
    }
  ]
}
```

### `GET /api/v1/stores/:id`

Get store details (owner or API key).

### `PATCH /api/v1/stores/:id`

Update store name, plan, or Stripe IDs (owner or API key).

### `DELETE /api/v1/stores/:id`

Delete a store and its data (owner or API key).

### `GET /api/v1/stores/:id/scene`

Return the scene manifest and 3D asset URLs. **Public.**

```json
{
  "storeId": "store_123",
  "format": "glb",
  "assetUrl": "https://cdn.walkin.app/scenes/store_123.glb",
  "hotspots": [
    {
      "id": "hp_1",
      "position": [1.2, 0.0, -3.5],
      "productId": "sku_abc",
      "label": "Organic Milk"
    }
  ]
}
```

### `PUT /api/v1/stores/:id/scene`

Save the scene manifest (owner or API key).

### `GET /api/v1/stores/:id/products`

Return products with realtime availability. **Public.**

```json
{
  "products": [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "sku": "sku_abc",
      "name": "Organic Milk 1L",
      "offers": {
        "@type": "Offer",
        "price": "3.49",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "inventoryLevel": 14
      },
      "location": { "aisle": 3, "shelf": "B", "coordinates": [1.2, 0.0, -3.5] }
    }
  ]
}
```

### `POST /api/v1/stores/:id/products`

Upsert a product (owner or API key).

### `DELETE /api/v1/stores/:id/products`

Delete a product by SKU (owner or API key).

### `GET /api/v1/stores/:id/ads`

List sponsored ads for the store (owner or API key).

### `POST /api/v1/stores/:id/ads`

Create or update an ad (owner or API key).

### `DELETE /api/v1/stores/:id/ads`

Delete an ad (owner or API key).

### `GET /api/v1/stores/:id/api-keys`

List API keys for the store (owner or API key).

### `POST /api/v1/stores/:id/api-keys`

Create a new API key (owner or API key).

### `DELETE /api/v1/stores/:id/api-keys`

Revoke an API key (owner or API key).

### `GET /api/v1/stores/:id/analytics`

Get aggregated analytics for the store (owner or API key).

```json
{
  "storeId": "store_123",
  "sceneLoads": 142,
  "searches": 38,
  "chatMessages": 21,
  "hotspotClicks": 64,
  "addToList": 12,
  "checkoutClicks": 3,
  "adImpressions": 89,
  "adClicks": 7,
  "adCtr": 0.0787,
  "adMetrics": [...]
}
```

### `POST /api/v1/stores/:id/guide`

Ask for a shopping route or product guidance.

```json
// Request
{
  "query": "Where is the almond milk?",
  "language": "en",
  "from": { "x": 0, "y": 0, "z": 0 },
  "stream": false
}

// Response
{
  "answer": "Almond milk is in aisle 3, shelf B, near organic milk.",
  "route": [{ "x": 0, "y": 0, "z": 0 }, { "x": 1.2, "y": 0, "z": -3.5 }],
  "productId": "sku_def"
}
```

Set `stream: true` to receive an NDJSON stream:

```ndjson
{"type":"text","content":"Almond"}
{"type":"text","content":" milk"}
{"type":"text","content":" is"}
...
{"type":"done","response":{"answer":"Almond milk is in aisle 3, shelf B.","productId":"sku_def","route":[{"x":0,"y":0,"z":0},{"x":1.2,"y":0,"z":-3.5}]}}
```

The AI provider uses function calling (`find_product`, `check_stock`) against the store's live product catalog so answers are grounded in real inventory.

### `POST /api/v1/stores/:id/photogrammetry/process`

Process a photo set through the configured photogrammetry backend.

```json
// Request
{
  "job": {
    "id": "job_123",
    "storeId": "store_123",
    "userId": "user_123",
    "photoSetId": "ps_123",
    "status": "queued"
  },
  "photoSet": {
    "id": "ps_123",
    "storeId": "store_123",
    "userId": "user_123",
    "images": [
      {
        "id": "photo_1",
        "name": "front.jpg",
        "dataUrl": "data:image/jpeg;base64,...",
        "width": 1920,
        "height": 1080
      }
    ],
    "createdAt": "2026-07-30T18:00:00.000Z"
  }
}

// Response
{
  "job": {
    "id": "job_123",
    "storeId": "store_123",
    "userId": "user_123",
    "photoSetId": "ps_123",
    "status": "completed",
    "outputUrl": "data:model/gltf-binary;base64,...",
    "processor": "cloud"
  },
  "metadata": {
    "jobId": "cloud_job_abc",
    "downloadUrl": "https://api.example.com/jobs/cloud_job_abc/download"
  }
}
```

Requires `PHOTOGRAMMETRY_BACKEND=cloud` plus the upload/download/status URLs and API key in `.env.local`.

### `POST /api/v1/stores/:id/inventory/csv`

Bulk-import products via CSV.

```http
Content-Type: multipart/form-data
```

```json
// Response
{
  "sourceId": "csv_123",
  "productsImported": 42,
  "products": [...]
}
```

Expected columns: `sku`, `name`, `price`, `currency`, `inventoryLevel` (or `stock`), `availability`, `aisle`, `shelf`.

### `POST /api/v1/stores/:id/inventory/webhooks/shopify`

Receive Shopify product/inventory webhooks.

Set in Shopify:
- `products/update`
- `products/create`
- `inventory_levels/update`

Set `SHOPIFY_WEBHOOK_SECRET` and forward `X-Shopify-Hmac-Sha256` for signature verification.

### `POST /api/v1/analytics/events`

Batch-submit telemetry events. The server forwards them to the configured provider (PostHog, Segment, GA4, or console).

```json
// Request
{
  "events": [
    {
      "event": "ad.click",
      "timestamp": "2026-07-30T18:00:00.000Z",
      "payload": { "id": "ad_123", "position": "inline", "sponsor": "Fresh Farms" }
    }
  ]
}

// Response
{
  "received": 1,
  "failed": 0
}
```

## Robot Integration

Robots should:

1. Fetch the scene manifest to understand spatial layout.
2. Poll or subscribe to inventory endpoints for stock/prices.
3. Use `/guide` to resolve natural-language shopper requests.
4. Post back telemetry to `/analytics/events` (with consent).

Future: WebSocket `/stream` for real-time position updates and collaborative shopping.

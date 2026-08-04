import { validateInput } from "../../../../../_middleware.js";

const DEMO_SCENES = {
  "demo-coffee": {
    storeId: "demo-coffee",
    format: "equirectangular",
    assetUrl: "https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/decor_shop.jpg",
    hotspots: [],
    updatedAt: new Date().toISOString(),
  },
  "demo-library": {
    storeId: "demo-library",
    format: "equirectangular",
    assetUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ec/SCUT_Library_Lobby_Photosphere.jpg",
    hotspots: [],
    updatedAt: new Date().toISOString(),
  },
  "demo-home-library": {
    storeId: "demo-home-library",
    format: "equirectangular",
    assetUrl: "https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/decor_shop.jpg",
    hotspots: [],
    updatedAt: new Date().toISOString(),
  },
  "demo-office": {
    storeId: "demo-office",
    format: "equirectangular",
    assetUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bf/Leipzig-Hauptbahnhof-Westhalle-IMG_3474-8x5B-360x180G-PanoS-26-11-2024.jpg",
    hotspots: [],
    updatedAt: new Date().toISOString(),
  },
  "demo-dentist": {
    storeId: "demo-dentist",
    format: "equirectangular",
    assetUrl: "https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/decor_shop.jpg",
    hotspots: [],
    updatedAt: new Date().toISOString(),
  },
  "demo-bookstore": {
    storeId: "demo-bookstore",
    format: "equirectangular",
    assetUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4f/2018_07_15_-_Interior_of_North_Rim_Visitor_Center_-_360_%C2%B0_Panorama_%2855080737994%29.jpg",
    hotspots: [],
    updatedAt: new Date().toISOString(),
  },
};

const sceneSchema = {
  format: { required: true, type: "string", pattern: /^(equirectangular|glb)$/ },
  assetUrl: { required: true, type: "string", maxLength: 500 },
};

export async function onRequestGet(context) {
  const { id } = context.params;

  // Sanitize ID
  const storeId = String(id).replace(/[^a-zA-Z0-9-_]/g, "").slice(0, 50);

  // Check demo scenes first.
  if (DEMO_SCENES[storeId]) {
    return Response.json(DEMO_SCENES[storeId]);
  }

  try {
    const scene = await context.env.KV.get(`scene:${storeId}`, "json");
    if (!scene) {
      return Response.json({ error: "Scene not found" }, { status: 404 });
    }
    return Response.json(scene);
  } catch {
    return Response.json({ error: "Scene not found" }, { status: 404 });
  }
}

export async function onRequestPut(context) {
  try {
    const { id } = context.params;
    const body = await context.request.json();

    // Sanitize ID
    const storeId = String(id).replace(/[^a-zA-Z0-9-_]/g, "").slice(0, 50);

    // Validate input
    const validation = validateInput(body, sceneSchema);
    if (!validation.valid) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    // Sanitize inputs
    const scene = {
      storeId,
      format: String(body.format).slice(0, 20),
      assetUrl: String(body.assetUrl).slice(0, 500),
      hotspots: Array.isArray(body.hotspots) ? body.hotspots.slice(0, 100) : [],
      updatedAt: new Date().toISOString(),
    };

    try {
      await context.env.KV.put(`scene:${storeId}`, JSON.stringify(scene));
    } catch {
      return Response.json({ saved: false, warning: "Storage limit exceeded" }, { status: 503 });
    }

    return Response.json({ saved: true });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Invalid request" },
      { status: 400 }
    );
  }
}

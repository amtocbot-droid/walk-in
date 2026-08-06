const DEMO_SCENES = {
  "demo-coffee": {
    storeId: "demo-coffee",
    format: "equirectangular",
    assetUrl: "https://upload.wikimedia.org/wikipedia/commons/3/39/At_the_Fish_Shop_360%C2%B0_%2831216237834%29.jpg",
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
    assetUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Cerro_Tololo_Hotel_Interior_360_Panorama_%282022_04_08_Pano360_Tololo_Hotel_Room-CC%29.jpg",
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
    assetUrl: "https://upload.wikimedia.org/wikipedia/commons/b/be/Biblioteca_P%C3%BAblica_de_%C3%89vora_-_Sala_de_exposi%C3%A7%C3%B5es_%28360_panorama%29.jpg",
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

export async function onRequestGet(context) {
  const { id } = context.params;

  // Check demo scenes first.
  if (DEMO_SCENES[id]) {
    return Response.json(DEMO_SCENES[id]);
  }

  const scene = await context.env.KV.get(`scene:${id}`, "json");
  if (!scene) {
    return Response.json({ error: "Scene not found" }, { status: 404 });
  }

  return Response.json(scene);
}

export async function onRequestPut(context) {
  const { id } = context.params;
  const body = await context.request.json();

  const scene = {
    storeId: id,
    ...body,
    updatedAt: new Date().toISOString(),
  };

  await context.env.KV.put(`scene:${id}`, JSON.stringify(scene));
  return Response.json({ saved: true });
}

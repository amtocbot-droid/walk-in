const DEMO_STORES = [
  {
    id: "demo-coffee",
    ownerId: "demo",
    name: "Brew & Bean Coffee",
    plan: "pro",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "demo-library",
    ownerId: "demo",
    name: "Central Public Library",
    plan: "pro",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "demo-home-library",
    ownerId: "demo",
    name: "The Reading Nook",
    plan: "pro",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "demo-office",
    ownerId: "demo",
    name: "TechHub Coworking",
    plan: "pro",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "demo-dentist",
    ownerId: "demo",
    name: "Bright Smile Dental",
    plan: "pro",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "demo-bookstore",
    ownerId: "demo",
    name: "Chapter & Verse Books",
    plan: "pro",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

export async function onRequestGet(context) {
  // Don't use KV for demo data - serve static demo stores.
  // Only use KV for user-created stores.
  let userStores = [];
  try {
    const stored = await context.env.KV.get("stores", "json");
    userStores = stored ?? [];
  } catch {
    // KV unavailable or limit exceeded - continue with demo stores only.
  }

  const demoIds = new Set(DEMO_STORES.map((d) => d.id));
  const filtered = userStores.filter((s) => !demoIds.has(s.id));
  return Response.json({ stores: [...DEMO_STORES, ...filtered] });
}

export async function onRequestPost(context) {
  const body = await context.request.json();
  if (!body.name || !body.ownerId) {
    return Response.json({ error: "name and ownerId are required" }, { status: 400 });
  }

  let stores = [];
  try {
    stores = (await context.env.KV.get("stores", "json")) ?? [];
  } catch {
    // KV unavailable - continue with empty array.
  }

  const store = {
    id: `store_${Date.now().toString(36)}`,
    ownerId: body.ownerId,
    name: body.name,
    plan: "free",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  stores.push(store);

  try {
    await context.env.KV.put("stores", JSON.stringify(stores));
  } catch {
    // KV limit exceeded - return success but data won't persist.
    console.warn("KV put failed - store will not persist");
  }

  return Response.json({ store });
}

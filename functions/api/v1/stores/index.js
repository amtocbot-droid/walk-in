import { validateInput } from "../../../_middleware.js";

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

const storeSchema = {
  name: { required: true, type: "string", minLength: 1, maxLength: 100 },
  ownerId: { required: true, type: "string", minLength: 1, maxLength: 100 },
};

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
  try {
    const body = await context.request.json();

    // Validate input
    const validation = validateInput(body, storeSchema);
    if (!validation.valid) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    // Sanitize inputs
    const name = String(body.name).trim().slice(0, 100);
    const ownerId = String(body.ownerId).trim().slice(0, 100);

    let stores = [];
    try {
      stores = (await context.env.KV.get("stores", "json")) ?? [];
    } catch {
      // KV unavailable - continue with empty array.
    }

    const store = {
      id: `store_${Date.now().toString(36)}`,
      ownerId,
      name,
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
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Invalid request" },
      { status: 400 }
    );
  }
}

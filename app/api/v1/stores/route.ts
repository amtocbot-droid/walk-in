import { NextRequest, NextResponse } from "next/server";
import { listStores, createStore } from "@/lib/db";
import { checkRateLimit, getClientId, requireSessionOrApiKey, securityHeaders } from "@/lib/security";

export async function GET(request: NextRequest) {
  const clientId = getClientId(request);
  const limit = checkRateLimit(clientId);
  if (!limit.ok) {
    const res = NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    res.headers.set("Retry-After", String(limit.retryAfter));
    return res;
  }

  const stores = await listStores();
  const response = NextResponse.json({
    stores: stores.map((s) => ({
      id: s.id,
      name: s.name,
      url: `/s/${s.id}`,
      plan: s.plan,
    })),
  });

  return securityHeaders(response);
}

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);
  const limit = checkRateLimit(clientId);
  if (!limit.ok) {
    const res = NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    res.headers.set("Retry-After", String(limit.retryAfter));
    return res;
  }

  const auth = requireSessionOrApiKey(request);
  if (!auth.ok && auth.response) {
    return auth.response;
  }

  const body = (await request.json()) as { id?: string; name?: string; ownerId?: string; ownerEmail?: string };
  if (!body.name || !body.ownerId) {
    return NextResponse.json({ error: "name and ownerId are required" }, { status: 400 });
  }

  // Accept a client-supplied id so the owner dashboard's local store id
  // matches the server row and subsequent scene/product syncs resolve.
  const store = await createStore({ id: body.id, ownerId: body.ownerId, ownerEmail: body.ownerEmail, name: body.name });
  if (store.ownerId !== body.ownerId) {
    return NextResponse.json({ error: "A store with this id already exists" }, { status: 409 });
  }
  return securityHeaders(NextResponse.json({ store }));
}

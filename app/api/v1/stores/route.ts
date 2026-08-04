import { NextRequest, NextResponse } from "next/server";
import { listStores, createStore } from "@/lib/db";
import { checkRateLimit, getClientId, securityHeaders, withApiSecurity } from "@/lib/security";

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

export const POST = withApiSecurity(async (request: NextRequest) => {
  const body = (await request.json()) as { name?: string; ownerId?: string };
  if (!body.name || !body.ownerId) {
    return NextResponse.json({ error: "name and ownerId are required" }, { status: 400 });
  }

  const store = await createStore({ ownerId: body.ownerId, name: body.name });
  return NextResponse.json({ store });
});

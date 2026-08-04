import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addApiKey, revokeApiKey, getStore } from "@/lib/db";
import { withStoreApiSecurity } from "@/lib/security";

const paramsSchema = z.object({ id: z.string() });

export const GET = withStoreApiSecurity(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = paramsSchema.parse(await params);
  const store = await getStore(id);
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }
  return NextResponse.json({ apiKeys: store.apiKeys });
});

const createSchema = z.object({
  name: z.string().min(1),
  scopes: z.array(z.string()).min(1),
});

export const POST = withStoreApiSecurity(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = paramsSchema.parse(await params);
  const body = createSchema.parse(await request.json());

  const apiKey = await addApiKey(id, {
    name: body.name,
    key: `wk_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`,
    scopes: body.scopes,
  });

  if (!apiKey) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  return NextResponse.json({ apiKey });
});

const deleteSchema = z.object({ keyId: z.string() });

export const DELETE = withStoreApiSecurity(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = paramsSchema.parse(await params);
  const body = deleteSchema.parse(await request.json());

  const deleted = await revokeApiKey(id, body.keyId);
  if (!deleted) {
    return NextResponse.json({ error: "API key not found" }, { status: 404 });
  }

  return NextResponse.json({ deleted: true });
});

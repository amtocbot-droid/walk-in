import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStore, updateStore, deleteStore } from "@/lib/db";
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
  return NextResponse.json({ store });
});

const patchSchema = z.object({
  name: z.string().optional(),
  plan: z.enum(["free", "pro", "enterprise"]).optional(),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
});

export const PATCH = withStoreApiSecurity(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = paramsSchema.parse(await params);
  const body = patchSchema.parse(await request.json());

  const store = await updateStore(id, body);
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  return NextResponse.json({ store });
});

export const DELETE = withStoreApiSecurity(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = paramsSchema.parse(await params);
  const deleted = await deleteStore(id);
  if (!deleted) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }
  return NextResponse.json({ deleted: true });
});

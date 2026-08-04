import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAds, upsertAd, deleteAd } from "@/lib/db";
import { withStoreApiSecurity } from "@/lib/security";

const paramsSchema = z.object({ id: z.string() });

export const GET = withStoreApiSecurity(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = paramsSchema.parse(await params);
  return NextResponse.json({ ads: await getAds(id) });
});

const adSchema = z.object({
  id: z.string(),
  sponsor: z.string(),
  label: z.string(),
  cta: z.string(),
  position: z.enum(["top", "inline", "hotspot"]),
  productSku: z.string().optional(),
  dailyBudget: z.number().optional(),
  active: z.boolean(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  createdAt: z.string(),
});

export const POST = withStoreApiSecurity(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = paramsSchema.parse(await params);
  const body = adSchema.parse(await request.json());

  await upsertAd({
    ...body,
    storeId: id,
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ saved: true });
});

export const DELETE = withStoreApiSecurity(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = paramsSchema.parse(await params);
  const body = (await request.json()) as { adId?: string };
  if (!body.adId) {
    return NextResponse.json({ error: "adId is required" }, { status: 400 });
  }

  const deleted = await deleteAd(id, body.adId);
  if (!deleted) {
    return NextResponse.json({ error: "Ad not found" }, { status: 404 });
  }

  return NextResponse.json({ deleted: true });
});

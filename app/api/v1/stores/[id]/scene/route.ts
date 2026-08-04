import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { securityHeaders, withStoreApiSecurity } from "@/lib/security";
import { getScene, saveScene } from "@/lib/db";

const paramsSchema = z.object({ id: z.string() });

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = paramsSchema.parse(await params);
  const scene = await getScene(id);

  if (!scene) {
    return NextResponse.json({ error: "Scene not found" }, { status: 404 });
  }

  const response = NextResponse.json({
    "@context": "https://schema.org",
    "@type": "Store",
    ...scene,
  });
  return securityHeaders(response);
}

const sceneSchema = z.object({
  format: z.enum(["equirectangular", "glb"]),
  assetUrl: z.string().url(),
  hotspots: z.array(
    z.object({
      id: z.string(),
      position: z.tuple([z.number(), z.number(), z.number()]),
      productId: z.string(),
      label: z.string(),
    })
  ),
});

export const PUT = withStoreApiSecurity(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = paramsSchema.parse(await params);
  const body = sceneSchema.parse(await request.json());

  await saveScene({
    storeId: id,
    ...body,
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ saved: true });
});

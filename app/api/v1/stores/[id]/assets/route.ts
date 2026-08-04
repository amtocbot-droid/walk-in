import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withStoreApiSecurity } from "@/lib/security";
import { uploadAsset, getPublicAssetUrl } from "@/lib/s3";

const paramsSchema = z.object({ id: z.string() });

const bodySchema = z.object({
  key: z.string(),
  data: z.string(), // base64
  contentType: z.string(),
});

export const POST = withStoreApiSecurity(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = paramsSchema.parse(await params);
  const body = bodySchema.parse(await request.json());

  const buffer = Buffer.from(body.data, "base64");
  const key = `stores/${id}/${body.key}`;

  const url = await uploadAsset(key, buffer, body.contentType);

  return NextResponse.json({ url, publicUrl: getPublicAssetUrl(key) });
});

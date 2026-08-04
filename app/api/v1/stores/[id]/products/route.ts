import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getProducts, upsertProduct, deleteProduct } from "@/lib/db";
import { securityHeaders, withStoreApiSecurity } from "@/lib/security";

const paramsSchema = z.object({ id: z.string() });

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = paramsSchema.parse(await params);
  const products = await getProducts(id);

  const response = NextResponse.json({
    products: products.map((p) => ({
      "@context": "https://schema.org",
      "@type": "Product",
      sku: p.sku,
      name: p.name,
      offers: {
        "@type": "Offer",
        price: p.price.toFixed(2),
        priceCurrency: p.currency,
        availability: `https://schema.org/${p.availability}`,
        inventoryLevel: p.inventoryLevel,
      },
      location: {
        aisle: p.aisle,
        shelf: p.shelf,
        coordinates: p.coordinates,
      },
    })),
  });
  return securityHeaders(response);
}

const productSchema = z.object({
  sku: z.string(),
  name: z.string(),
  price: z.number(),
  currency: z.string(),
  availability: z.enum(["InStock", "OutOfStock", "LimitedAvailability"]),
  inventoryLevel: z.number(),
  aisle: z.string().optional(),
  shelf: z.string().optional(),
  coordinates: z.tuple([z.number(), z.number(), z.number()]).optional(),
});

export const POST = withStoreApiSecurity(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = paramsSchema.parse(await params);
  const body = productSchema.parse(await request.json());

  await upsertProduct({
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
  const body = (await request.json()) as { sku?: string };
  if (!body.sku) {
    return NextResponse.json({ error: "sku is required" }, { status: 400 });
  }

  const deleted = await deleteProduct(id, body.sku);
  if (!deleted) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ deleted: true });
});

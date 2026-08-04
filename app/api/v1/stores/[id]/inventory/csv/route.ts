import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withStoreApiSecurity } from "@/lib/security";
import { auth } from "@/auth";
import { parseCsvProducts, saveCsvSource } from "@/lib/inventory-sources";

const paramsSchema = z.object({ id: z.string() });

export const POST = withStoreApiSecurity(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = paramsSchema.parse(await params);
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const label = (form.get("label") as string) || "CSV Upload";

  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Missing CSV file" }, { status: 400 });
  }

  const text = await file.text();
  const products = parseCsvProducts(text);

  const source = saveCsvSource(userId, id, label, products);

  return NextResponse.json({
    sourceId: source.id,
    productsImported: products.length,
    products,
  });
});

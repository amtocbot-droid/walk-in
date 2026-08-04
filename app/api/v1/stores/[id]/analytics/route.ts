import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getTelemetryEvents, getAdMetrics } from "@/lib/db";
import { withStoreApiSecurity } from "@/lib/security";

const paramsSchema = z.object({ id: z.string() });

export const GET = withStoreApiSecurity(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = paramsSchema.parse(await params);
  const events = await getTelemetryEvents(id);
  const adMetrics = await getAdMetrics(id);

  const sceneLoads = events.filter((e) => e.event === "scene.loaded").length;
  const searches = events.filter((e) => e.event === "search.select").length;
  const chatMessages = events.filter((e) => e.event === "chat.message").length;
  const hotspotClicks = events.filter((e) => e.event === "hotspot.click").length;
  const addToList = events.filter((e) => e.event === "conversion.add_to_list").length;
  const checkoutClicks = events.filter((e) => e.event === "conversion.checkout_click").length;

  const totalImpressions = adMetrics.reduce((sum, m) => sum + m.impressions, 0);
  const totalClicks = adMetrics.reduce((sum, m) => sum + m.clicks, 0);

  return NextResponse.json({
    storeId: id,
    sceneLoads,
    searches,
    chatMessages,
    hotspotClicks,
    addToList,
    checkoutClicks,
    adImpressions: totalImpressions,
    adClicks: totalClicks,
    adCtr: totalImpressions > 0 ? totalClicks / totalImpressions : 0,
    adMetrics,
  });
});

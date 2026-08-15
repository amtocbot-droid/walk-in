"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import SearchPanel from "@/components/ui/SearchPanel";
import ChatPanel from "@/components/ui/ChatPanel";
import VoiceInput from "@/components/ui/VoiceInput";
import AdSpot from "@/components/ui/AdSpot";
import ShoppingListPanel from "@/components/ui/ShoppingListPanel";
import DemoSelector from "@/components/ui/DemoSelector";
import PushNotificationToggle from "@/components/ui/PushNotificationToggle";
import { useShoppingList } from "@/lib/shopping-list";
import { trackEvent } from "@/lib/telemetry";
import { ASSETS } from "@/lib/config";
import { SponsoredAd, getActiveAds } from "@/lib/retail-media";
import { DEMO_ESTABLISHMENTS, DemoEstablishment } from "@/lib/demos";

const SceneViewer = dynamic(
  () => import("@/components/3d/SceneViewer"),
  { ssr: false }
);

const DEMO_AD: SponsoredAd = {
  id: "demo-sponsored-aisle",
  storeId: "demo-store",
  sponsor: "Fresh Farms",
  label: "Try our new organic oat milk — 20% off today",
  cta: "Tap to locate in aisle 3",
  position: "inline",
  active: true,
  createdAt: new Date().toISOString(),
};

interface ShopperExperienceProps {
  storeId: string;
  publicMode?: boolean;
  showBranding?: boolean;
  demoMode?: boolean;
  onDemoChange?: (demoId: string) => void;
}

export default function ShopperExperience({
  storeId,
  publicMode = false,
  showBranding = true,
  demoMode = false,
  onDemoChange,
}: ShopperExperienceProps) {
  const [panel, setPanel] = useState<"none" | "search" | "chat" | "list">("none");
  const [voiceQuery, setVoiceQuery] = useState<string | undefined>(undefined);
  const [activeAd, setActiveAd] = useState<SponsoredAd | null>(null);
  const [currentDemo, setCurrentDemo] = useState<DemoEstablishment | null>(null);
  const { setStoreId, items } = useShoppingList();

  useEffect(() => {
    setStoreId(storeId);

    if (demoMode) {
      const demo = DEMO_ESTABLISHMENTS.find((d) => d.id === storeId) ?? DEMO_ESTABLISHMENTS[0];
      setCurrentDemo(demo);
      setActiveAd(DEMO_AD);
    } else {
      const ads = getActiveAds(storeId);
      setActiveAd(ads.find((a) => a.position === "inline") ?? (storeId === "demo-store" ? DEMO_AD : null));
    }
  }, [storeId, setStoreId, demoMode]);

  const handleDemoChange = (demoId: string) => {
    onDemoChange?.(demoId);
  };

  const openSearch = () => {
    setPanel("search");
    trackEvent("ui.open_search", { storeId });
  };

  const openChat = (query?: string) => {
    setVoiceQuery(query);
    setPanel("chat");
    trackEvent("ui.open_chat", { source: query ? "voice" : "button", storeId });
  };

  const openList = () => {
    setPanel("list");
    trackEvent("ui.open_list", { storeId });
  };

  return (
    <main className="relative h-screen w-screen bg-slate-50">
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center text-slate-800">
            Loading 3D scene…
          </div>
        }
      >
        <SceneViewer storeId={storeId} publicMode={publicMode} demoMode={demoMode} />
      </Suspense>

      {showBranding && (
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between bg-gradient-to-b from-white/80 to-transparent p-4 backdrop-blur">
          <h1 className="text-lg font-bold text-slate-800 drop-shadow">Walk In</h1>
          <div className="flex gap-2">
            <button
              onClick={openList}
              className="rounded-full bg-white/80 px-4 py-2 text-sm text-slate-700 shadow-sm backdrop-blur hover:bg-white"
            >
              List ({items.length})
            </button>
            <button
              onClick={openSearch}
              className="rounded-full bg-white/80 px-4 py-2 text-sm text-slate-700 shadow-sm backdrop-blur hover:bg-white"
            >
              Search
            </button>
            <button
              onClick={() => openChat()}
              className="rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-sky-600"
            >
              AI Guide
            </button>
          </div>
        </div>
      )}

      {demoMode && (
        <DemoSelector
          demos={DEMO_ESTABLISHMENTS}
          currentDemoId={storeId}
          onSelect={handleDemoChange}
        />
      )}

      {demoMode && currentDemo && (
        <div className="absolute top-16 right-4 z-20 max-w-xs rounded-xl border border-slate-200 bg-white/90 p-4 text-slate-800 shadow-lg backdrop-blur">
          <h2 className="font-bold">{currentDemo.name}</h2>
          <p className="text-xs text-sky-600">{currentDemo.type}</p>
          <p className="mt-2 text-sm text-slate-600">{currentDemo.description}</p>
          <p className="mt-2 text-xs text-slate-500">
            {currentDemo.products.length} items to explore
          </p>
        </div>
      )}

      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3">
        <VoiceInput onResult={(text) => openChat(text)} />
        <PushNotificationToggle />
      </div>

      {activeAd && (
        <div className="absolute bottom-6 left-4 z-10 w-56">
          <AdSpot ad={activeAd} />
        </div>
      )}

      {panel === "search" && (
        <SearchPanel onClose={() => setPanel("none")} storeId={storeId} demoMode={demoMode} />
      )}
      {panel === "chat" && (
        <ChatPanel onClose={() => setPanel("none")} initialQuery={voiceQuery} storeId={storeId} />
      )}
      {panel === "list" && (
        <ShoppingListPanel onClose={() => setPanel("none")} />
      )}

      <div className="absolute bottom-2 right-4 z-10 max-w-xs text-right">
        <p className="text-[10px] text-slate-500">
          {demoMode && currentDemo ? currentDemo.panoramaAttribution : ASSETS.demoPanoramaAttribution}
        </p>
      </div>
    </main>
  );
}

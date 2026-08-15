"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import ShopperExperience from "@/components/shopper/ShopperExperience";

function StoreContent() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get("id") ?? "demo-store";
  // ?preview=1 loads the owner's localStorage scene instead of the public API.
  const preview = searchParams.get("preview") === "1";
  return <ShopperExperience storeId={storeId} publicMode={!preview} />;
}

export default function StorePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
          Loading store…
        </div>
      }
    >
      <StoreContent />
    </Suspense>
  );
}

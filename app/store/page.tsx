"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import ShopperExperience from "@/components/shopper/ShopperExperience";

function StoreContent() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get("id") ?? "demo-store";
  return <ShopperExperience storeId={storeId} publicMode={true} />;
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

"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import ShopperExperience from "@/components/shopper/ShopperExperience";

function DemoContent() {
  const searchParams = useSearchParams();
  const initialDemo = searchParams.get("type") ?? "demo-coffee";
  const [demoId, setDemoId] = useState(initialDemo);

  return (
    <ShopperExperience
      storeId={demoId}
      publicMode={false}
      demoMode={true}
      onDemoChange={setDemoId}
    />
  );
}

export default function DemoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-800">
          Loading demo…
        </div>
      }
    >
      <DemoContent />
    </Suspense>
  );
}

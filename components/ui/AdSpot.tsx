"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/telemetry";
import { SponsoredAd, trackAdImpression, trackAdClick } from "@/lib/retail-media";

interface AdSpotProps {
  ad: SponsoredAd;
  onClick?: (ad: SponsoredAd) => void;
}

export default function AdSpot({ ad, onClick }: AdSpotProps) {
  useEffect(() => {
    trackAdImpression(ad.id, ad.storeId);
    trackEvent("ad.impression", {
      id: ad.id,
      position: ad.position,
      sponsor: ad.sponsor,
      productSku: ad.productSku,
    });
  }, [ad.id, ad.storeId, ad.position, ad.sponsor, ad.productSku]);

  const handleClick = () => {
    trackAdClick(ad.id, ad.storeId);
    trackEvent("ad.click", {
      id: ad.id,
      position: ad.position,
      sponsor: ad.sponsor,
      productSku: ad.productSku,
    });
    onClick?.(ad);
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer rounded-xl border border-brand-500/30 bg-gradient-to-br from-brand-900/80 to-slate-900/90 p-3 text-white shadow-lg backdrop-blur"
    >
      <p className="text-[10px] uppercase tracking-wider text-brand-300">Sponsored · {ad.sponsor}</p>
      <p className="mt-1 text-sm font-semibold">{ad.label}</p>
      <p className="mt-1 text-xs text-brand-200">{ad.cta}</p>
    </div>
  );
}

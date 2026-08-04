"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useWalkInStore, Hotspot as HotspotType } from "@/lib/store";
import { fetchProducts } from "@/lib/inventory";
import { trackEvent } from "@/lib/telemetry";
import { ASSETS } from "@/lib/config";
import { loadOwnerScene } from "@/lib/scene-config";
import { getDemoEstablishment } from "@/lib/demos";
import PanoramaRenderer from "./PanoramaRenderer";
import MeshViewer from "./MeshViewer";

type SceneMode = "panorama" | "mesh";

interface SceneViewerProps {
  storeId: string;
  /** If true, load public scene from API instead of owner localStorage. */
  publicMode?: boolean;
  /** If true, load demo establishment data instead of API. */
  demoMode?: boolean;
}

export default function SceneViewer({ storeId, publicMode = false, demoMode = false }: SceneViewerProps) {
  const { setScene, setLoading, scene } = useWalkInStore();
  const { data: session } = useSession();
  const [mode, setMode] = useState<SceneMode>("panorama");
  const [assetUrl, setAssetUrl] = useState<string>(ASSETS.demoPanorama);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    async function load() {
      const userId = session?.user?.id;
      let hotspots: HotspotType[] = [];
      let preferredMode: SceneMode = "panorama";
      let url = ASSETS.demoPanorama;

      if (demoMode) {
        // Demo mode: load from demo configuration.
        const demo = getDemoEstablishment(storeId);
        if (demo) {
          url = demo.panoramaUrl;
          hotspots = demo.products
            .filter((p) => p.coordinates)
            .map((p, i) => ({
              id: `hp_${i}`,
              position: p.coordinates!,
              productId: p.sku,
              label: p.name,
            }));
        }
      } else if (publicMode) {
        // Public storefront: fetch scene and products from API.
        try {
          const sceneRes = await fetch(`/api/v1/stores/${storeId}/scene`);
          if (sceneRes.ok) {
            const sceneData = await sceneRes.json();
            url = sceneData.assetUrl;
            preferredMode = sceneData.format === "glb" ? "mesh" : "panorama";
            hotspots = sceneData.hotspots ?? [];
          }
        } catch (err) {
          console.error("Failed to load public scene:", err);
        }

        try {
          const productsRes = await fetch(`/api/v1/stores/${storeId}/products`);
          if (productsRes.ok) {
            const data = await productsRes.json();
            if (data.products?.length) {
              hotspots = data.products
                .filter((p: { location?: { coordinates?: [number, number, number] } }) => p.location?.coordinates)
                .map((p: { sku: string; name: string; location: { coordinates: [number, number, number] } }, i: number) => ({
                  id: `hp_${i}`,
                  position: p.location.coordinates,
                  productId: p.sku,
                  label: p.name,
                }));
            }
          }
        } catch (err) {
          console.error("Failed to load public products:", err);
        }
      } else {
        // Owner preview: load from localStorage and inventory mock.
        const owner = userId ? loadOwnerScene(userId, storeId) : null;
        const products = await fetchProducts(storeId, userId);
        hotspots = products
          .filter((p) => p.coordinates)
          .map((p, i) => ({
            id: `hp_${i}`,
            position: p.coordinates!,
            productId: p.sku,
            label: p.name,
          }));

        preferredMode = owner?.meshUrl ? "mesh" : "panorama";
        url = owner?.meshUrl || owner?.panoramaUrl || ASSETS.demoPanorama;
      }

      if (!mounted) return;

      setMode(preferredMode);
      setAssetUrl(url);
      setScene({
        storeId,
        format: preferredMode === "mesh" ? "glb" : "equirectangular",
        assetUrl: url,
        hotspots,
      });
      setLoading(false);
      trackEvent("scene.loaded", {
        storeId,
        format: preferredMode === "mesh" ? "glb" : "equirectangular",
        source: demoMode ? "demo" : publicMode ? "public" : "owner",
      });
    }

    load();
    return () => {
      mounted = false;
    };
  }, [storeId, setScene, setLoading, session, publicMode, demoMode]);

  if (!scene) {
    return (
      <div className="flex h-full w-full items-center justify-center text-white">
        Loading scene…
      </div>
    );
  }

  return mode === "mesh" ? (
    <MeshViewer url={assetUrl} hotspots={scene.hotspots} />
  ) : (
    <PanoramaRenderer url={assetUrl} hotspots={scene.hotspots} />
  );
}

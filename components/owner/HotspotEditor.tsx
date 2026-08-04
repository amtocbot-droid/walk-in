"use client";

import { useRef } from "react";
import { Product } from "@/lib/store";

interface HotspotEditorProps {
  panoramaUrl: string;
  products: Product[];
  selectedSku?: string;
  onSelect: (product: Product) => void;
  onAdd: (product: Product) => void;
}

export function equirectToSphere(
  x: number,
  y: number,
  width: number,
  height: number,
  radius = 4
): [number, number, number] {
  const theta = (x / width) * Math.PI * 2; // azimuth
  const phi = (0.5 - y / height) * Math.PI; // elevation

  const px = Math.cos(phi) * Math.sin(theta) * radius;
  const py = Math.sin(phi) * radius;
  const pz = Math.cos(phi) * Math.cos(theta) * radius;

  return [px, py, pz];
}

function generateSku(): string {
  return `sku_${Date.now().toString(36)}`;
}

export default function HotspotEditor({
  panoramaUrl,
  products,
  selectedSku,
  onSelect,
  onAdd,
}: HotspotEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = imageRef.current;
    if (!img) return;

    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const coords = equirectToSphere(x, y, rect.width, rect.height);

    const product: Product = {
      sku: generateSku(),
      name: "New Product",
      price: 0,
      currency: "USD",
      availability: "InStock",
      inventoryLevel: 0,
      aisle: "1",
      shelf: "A",
      coordinates: coords,
    };

    onAdd(product);
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-auto bg-black"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- raw img needed for click-coordinate mapping */}
      <img
        ref={imageRef}
        src={panoramaUrl}
        alt="360° panorama editor"
        onClick={handleClick}
        className="h-full w-auto max-w-none cursor-crosshair"
        draggable={false}
      />

      {products.map((p) => {
        if (!p.coordinates || !imageRef.current) return null;
        const img = imageRef.current;
        const rect = img.getBoundingClientRect();

        // Convert sphere coords back to image coords for overlay positioning.
        const [px, py, pz] = p.coordinates;
        const r = Math.sqrt(px * px + py * py + pz * pz);
        const theta = Math.atan2(px, pz);
        const phi = Math.asin(py / r);

        const x = ((theta / (Math.PI * 2) + 1) % 1) * rect.width;
        const y = (0.5 - phi / Math.PI) * rect.height;

        return (
          <button
            key={p.sku}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(p);
            }}
            style={{ left: x, top: y }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-1 shadow-lg ${
              selectedSku === p.sku
                ? "bg-brand-400 ring-2 ring-white"
                : "bg-brand-600 hover:bg-brand-500"
            }`}
            title={p.name}
          >
            <span className="block h-3 w-3 rounded-full bg-white" />
          </button>
        );
      })}

      <div className="pointer-events-none absolute bottom-4 left-4 rounded bg-black/70 px-3 py-2 text-xs text-white">
        Click anywhere on the panorama to add a product hotspot.
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { trackEvent } from "@/lib/telemetry";

export default function PerformanceMonitor() {
  const { gl } = useThree();

  useEffect(() => {
    const renderer = gl;
    const start = performance.now();

    const send = () => {
      const loadTime = performance.now() - start;
      const info = renderer.info;
      trackEvent("performance.snapshot", {
        loadTimeMs: Math.round(loadTime),
        calls: info.render.calls,
        triangles: info.render.triangles,
        geometries: info.memory.geometries,
        textures: info.memory.textures,
      });
    };

    const id = setInterval(send, 10000);
    return () => clearInterval(id);
  }, [gl]);

  return null;
}

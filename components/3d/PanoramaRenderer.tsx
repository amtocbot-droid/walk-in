"use client";

import { useRef } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { Hotspot as HotspotType } from "@/lib/store";
import Hotspot from "@/components/ui/Hotspot";
import PerformanceMonitor from "./PerformanceMonitor";

function EnvironmentSphere({ url }: { url: string }) {
  const texture = useLoader(THREE.TextureLoader, url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.mapping = THREE.EquirectangularReflectionMapping;

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 64, 64]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

function Hotspots({ hotspots }: { hotspots: HotspotType[] }) {
  return (
    <group>
      {hotspots.map((hp) => (
        <HotspotMesh key={hp.id} hotspot={hp} />
      ))}
    </group>
  );
}

function HotspotMesh({ hotspot }: { hotspot: HotspotType }) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh ref={meshRef} position={hotspot.position}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.5} />
      <Html distanceFactor={10}>
        <Hotspot hotspot={hotspot} />
      </Html>
    </mesh>
  );
}

export default function PanoramaRenderer({
  url,
  hotspots,
}: {
  url: string;
  hotspots: HotspotType[];
}) {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 0.1] }}>
        <EnvironmentSphere key={url} url={url} />
        <ambientLight intensity={0.8} />
        <Hotspots hotspots={hotspots} />
        <PerformanceMonitor />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          rotateSpeed={-0.3}
          zoomSpeed={0.8}
          minDistance={0.01}
          maxDistance={0.5}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}

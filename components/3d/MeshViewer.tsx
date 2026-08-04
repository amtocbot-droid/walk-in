"use client";

import { useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { Hotspot as HotspotType } from "@/lib/store";
import Hotspot from "@/components/ui/Hotspot";
import PerformanceMonitor from "./PerformanceMonitor";

function CameraController() {
  const { camera } = useThree();
  useFrame(() => {
    // Keep camera near origin for mesh walk-throughs.
    if (camera.position.length() > 10) {
      camera.position.setLength(10);
    }
  });
  return null;
}

function HotspotMesh({ hotspot }: { hotspot: HotspotType }) {
  return (
    <mesh position={hotspot.position}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.5} />
      <Html distanceFactor={10}>
        <Hotspot hotspot={hotspot} />
      </Html>
    </mesh>
  );
}

function Model({ url, hotspots }: { url: string; hotspots: HotspotType[] }) {
  const { scene } = useGLTF(url);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <>
      <primitive object={scene} />
      {hotspots.map((hp) => (
        <HotspotMesh key={hp.id} hotspot={hp} />
      ))}
    </>
  );
}

interface MeshViewerProps {
  url: string;
  hotspots: HotspotType[];
}

export default function MeshViewer({ url, hotspots }: MeshViewerProps) {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ fov: 60, near: 0.1, far: 100 }}>
        <CameraController />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 7]} intensity={1} castShadow />
        <Model url={url} hotspots={hotspots} />
        <PerformanceMonitor />
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
          minDistance={0.5}
          maxDistance={8}
        />
      </Canvas>
    </div>
  );
}

import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { PhotoSet, Processor } from "../types";

export class PlaceholderProcessor implements Processor {
  readonly name = "placeholder";

  async process(photoSet: PhotoSet, onProgress?: (message: string) => void): Promise<Blob> {
    onProgress?.("Generating placeholder mesh from photos…");

    const scene = new THREE.Scene();
    const size = 4;

    // Use the first image as a texture if available.
    const firstImage = photoSet.images[0];
    let material: THREE.Material = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      roughness: 0.7,
      metalness: 0.1,
    });

    if (firstImage) {
      const textureLoader = new THREE.TextureLoader();
      const texture = await loadTexture(firstImage.dataUrl, textureLoader);
      material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.7,
        metalness: 0.1,
      });
    }

    const geometry = new THREE.BoxGeometry(size * 2, size * 2, size * 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Add some simple point lights.
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    onProgress?.("Exporting GLB…");
    const exporter = new GLTFExporter();
    const glb = await exporter.parseAsync(scene, { binary: true });

    return new Blob([glb as ArrayBuffer], { type: "model/gltf-binary" });
  }
}

function loadTexture(dataUrl: string, loader: THREE.TextureLoader): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    loader.load(dataUrl, resolve, undefined, reject);
  });
}

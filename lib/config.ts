// Scene asset configuration.
// Replace DEMO_PANORAMA with any equirectangular (2:1) JPG/PNG photo of an establishment.
// Source options researched from Poly Haven (CC0) and Wikimedia Commons.

export const ASSETS = {
  demoPanorama:
    "https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/decor_shop.jpg",
  demoPanoramaAttribution: "Decor Shop interior — Poly Haven / CC0",
};

export const AI_PROVIDER = process.env.AI_PROVIDER ?? "auto";
export const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

"use client";

import { useState, useEffect } from "react";
import { generateSkyboxImage, waitForSkyboxGeneration, isSkyboxConfigured } from "@/lib/skybox";
import { generateStableDiffusionImage, isStableDiffusionConfigured, checkStableDiffusionHealth, getAvailableCheckpoints } from "@/lib/stable-diffusion";
import { trackEvent } from "@/lib/telemetry";

interface SkyboxGeneratorProps {
  onGenerated: (imageUrl: string) => void;
}

const PRESET_PROMPTS = [
  {
    label: "Coffee Shop",
    prompt: "cozy artisan coffee shop interior with wooden counter, espresso machine, pastry display case, warm lighting, comfortable seating, 360 panorama",
  },
  {
    label: "Library",
    prompt: "public library interior with tall wooden bookshelves, reading tables, green banker's lamps, quiet studious atmosphere, 360 panorama",
  },
  {
    label: "Modern Office",
    prompt: "modern coworking space with standing desks, ergonomic chairs, glass meeting rooms, indoor plants, natural light, 360 panorama",
  },
  {
    label: "Dentist Office",
    prompt: "dental office waiting room with comfortable chairs, reception desk, calming blue and white colors, medical posters, 360 panorama",
  },
  {
    label: "Home Library",
    prompt: "cozy home library with leather armchair, brass reading lamp, floor-to-ceiling bookshelves, warm fireplace, 360 panorama",
  },
  {
    label: "Bookstore",
    prompt: "independent bookstore with wooden shelves, staff picks display, reading nook, local author section, 360 panorama",
  },
];

type Provider = "skybox" | "stable-diffusion";

export default function SkyboxGenerator({ onGenerated }: SkyboxGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("people, person, blurry, low quality");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "generating" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [provider, setProvider] = useState<Provider>("skybox");
  const [sdAvailable, setSdAvailable] = useState(false);
  const [sdCheckpoints, setSdCheckpoints] = useState<string[]>([]);

  const skyboxConfigured = isSkyboxConfigured();
  const sdConfigured = isStableDiffusionConfigured();

  useEffect(() => {
    if (sdConfigured) {
      checkStableDiffusionHealth().then((healthy) => {
        setSdAvailable(healthy);
        if (healthy) {
          getAvailableCheckpoints().then(setSdCheckpoints);
        }
      });
    }
  }, [sdConfigured]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setStatus("generating");
    setMessage(provider === "skybox" ? "Submitting to Skybox AI…" : "Generating with local Stable Diffusion…");
    trackEvent("skybox.generate", { prompt: prompt.slice(0, 100), provider });

    try {
      let imageUrl: string;

      if (provider === "stable-diffusion" && sdAvailable) {
        const result = await generateStableDiffusionImage({
          prompt: prompt.trim(),
          negativePrompt: negativePrompt.trim(),
          width: 2048,
          height: 1024,
        });

        if (result.images.length === 0) {
          throw new Error("No images returned from Stable Diffusion");
        }

        imageUrl = `data:image/png;base64,${result.images[0]}`;
      } else {
        const result = await generateSkyboxImage({
          prompt: prompt.trim(),
          negativePrompt: negativePrompt.trim(),
        });

        setMessage("Generating 360° image…");
        const completed = await waitForSkyboxGeneration(result.id);

        if (!completed.imageUrl) {
          throw new Error("No image URL returned");
        }

        imageUrl = completed.imageUrl;
      }

      onGenerated(imageUrl);
      setStatus("done");
      setMessage("360° image generated and applied to your scene.");
      trackEvent("skybox.generated", { provider });
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (presetPrompt: string) => {
    setPrompt(presetPrompt);
  };

  if (!skyboxConfigured && !sdConfigured) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-4">
        <h3 className="font-semibold text-white">AI 360° Scene Generator</h3>
        <p className="mt-1 text-xs text-amber-200">
          Set <code>SKYBOX_API_KEY</code> for cloud generation or <code>SD_API_URL</code> for local
          Stable Diffusion in <code>.env.local</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-slate-800/50 p-4">
      <h3 className="font-semibold text-white">AI 360° Scene Generator</h3>
      <p className="text-xs text-slate-400">
        Describe your establishment and generate a 360° panorama.
      </p>

      <div className="flex gap-2">
        {skyboxConfigured && (
          <button
            onClick={() => setProvider("skybox")}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium ${
              provider === "skybox"
                ? "bg-brand-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Skybox AI (Cloud)
          </button>
        )}
        {sdConfigured && (
          <button
            onClick={() => setProvider("stable-diffusion")}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium ${
              provider === "stable-diffusion"
                ? "bg-brand-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Local SD (Free)
            {sdAvailable ? " ✓" : " ✗"}
          </button>
        )}
      </div>

      {provider === "stable-diffusion" && sdAvailable && sdCheckpoints.length === 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-950/30 p-3 text-xs text-amber-200">
          <p className="font-medium">No checkpoint models found</p>
          <p className="mt-1">
            Download a Stable Diffusion model to use local generation. Recommended:
          </p>
          <ul className="mt-1 list-inside list-disc space-y-1">
            <li>
              <a
                href="https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly.safetensors"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-400 hover:text-brand-300"
              >
                v1-5-pruned-emaonly.safetensors
              </a>
            </li>
            <li>
              Place it in <code>ComfyUI/models/checkpoints/</code>
            </li>
            <li>Restart ComfyUI or refresh models</li>
          </ul>
        </div>
      )}

      {provider === "stable-diffusion" && sdCheckpoints.length > 0 && (
        <p className="text-xs text-green-400">
          ✓ {sdCheckpoints.length} model{sdCheckpoints.length > 1 ? "s" : ""} available: {sdCheckpoints[0]}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {PRESET_PROMPTS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => applyPreset(preset.prompt)}
            className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-300 hover:bg-slate-600"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your establishment interior…"
        rows={3}
        className="w-full rounded-lg bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none"
      />

      <input
        type="text"
        value={negativePrompt}
        onChange={(e) => setNegativePrompt(e.target.value)}
        placeholder="Negative prompt (what to avoid)"
        className="w-full rounded-lg bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none"
      />

      <button
        onClick={handleGenerate}
        disabled={!prompt.trim() || loading || (provider === "stable-diffusion" && !sdAvailable)}
        className="w-full rounded-lg bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-50"
      >
        {loading ? "Generating…" : `Generate with ${provider === "skybox" ? "Skybox AI" : "Local SD"}`}
      </button>

      {status !== "idle" && (
        <p
          className={`text-xs ${
            status === "error"
              ? "text-red-400"
              : status === "done"
              ? "text-green-400"
              : "text-slate-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { DemoEstablishment } from "@/lib/demos";
import { trackEvent } from "@/lib/telemetry";

interface DemoSelectorProps {
  demos: DemoEstablishment[];
  currentDemoId: string;
  onSelect: (demoId: string) => void;
}

export default function DemoSelector({ demos, currentDemoId, onSelect }: DemoSelectorProps) {
  const [open, setOpen] = useState(false);

  const currentDemo = demos.find((d) => d.id === currentDemoId);

  const handleSelect = (demoId: string) => {
    trackEvent("demo.select", { demoId });
    onSelect(demoId);
    setOpen(false);
  };

  return (
    <div className="absolute top-16 left-4 z-20">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur hover:bg-white"
      >
        {currentDemo?.name ?? "Select Demo"} ▾
      </button>

      {open && (
        <div className="mt-2 w-80 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur">
          <h3 className="mb-3 font-semibold text-slate-800">Choose an establishment</h3>
          <ul className="space-y-2">
            {demos.map((demo) => (
              <li
                key={demo.id}
                onClick={() => handleSelect(demo.id)}
                className={`cursor-pointer rounded-xl p-3 transition-colors ${
                  demo.id === currentDemoId
                    ? "bg-sky-100 ring-1 ring-sky-300"
                    : "bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">{demo.name}</p>
                    <p className="text-xs text-sky-600">{demo.type}</p>
                  </div>
                  {demo.id === currentDemoId && (
                    <span className="text-xs text-sky-600">●</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-600">{demo.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

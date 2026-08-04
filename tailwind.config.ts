import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        "deep-navy": "#0F172A",
        "electric-blue": "#0EA5E9",
        "slate-text": "#334155",
        "surface": "#f7f9fb",
        "surface-container": "#eceef0",
        "surface-container-low": "#f2f4f6",
        "surface-container-lowest": "#ffffff",
        "glass-stroke": "rgba(255, 255, 255, 0.4)",
        "outline-variant": "#bec8d2",
        "primary-fixed": "#c9e6ff",
        "primary-fixed-dim": "#89ceff",
        "tertiary-fixed-dim": "#7bd0ff",
        "tertiary-container": "#00a7e0",
        "on-background": "#191c1e",
        "on-surface": "#191c1e",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        "body-md": ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        "body-lg": ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        "headline-md": ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        "headline-lg": ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        "display-xl": ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        "label-sm": ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        "label-xs": ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      fontSize: {
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "headline-md": ["32px", { lineHeight: "40px", fontWeight: "600" }],
        "headline-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-xl": ["72px", { lineHeight: "80px", letterSpacing: "-0.04em", fontWeight: "800" }],
        "label-sm": ["14px", { lineHeight: "20px", letterSpacing: "0.02em", fontWeight: "600" }],
        "label-xs": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "700" }],
      },
      spacing: {
        "gutter": "24px",
        "stack-sm": "8px",
        "margin-mobile": "20px",
        "stack-md": "16px",
        "stack-lg": "32px",
        "margin-desktop": "64px",
        "container-max": "1280px",
        "section-gap": "120px",
      },
      maxWidth: {
        "container-max": "1280px",
      },
    },
  },
  plugins: [],
};

export default config;

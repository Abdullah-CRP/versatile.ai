import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#000000",
          900: "#050505",
          850: "#0A0A0A",
          800: "#121214",
          700: "#18181B",
          600: "#27272A",
        },
        cyan: {
          glow: "#06b6d4",
          bright: "#22d3ee",
          neon: "#67e8f9",
          soft: "rgba(6, 182, 212, 0.15)",
        },
        silver: {
          100: "#F4F4F5",
          200: "#E4E4E7",
          300: "#D4D4D8",
          400: "#A1A1AA",
          500: "#71717A",
          600: "#52525B",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "glass-sm": "0 4px 24px -1px rgba(0, 0, 0, 0.4)",
        "glass-md": "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
        "glow-cyan": "0 0 25px rgba(6, 182, 212, 0.45)",
        "glow-cyan-lg": "0 0 50px rgba(6, 182, 212, 0.65)",
        "glow-cyan-sm": "0 0 12px rgba(6, 182, 212, 0.35)",
        "glow-amber": "0 0 25px rgba(251, 191, 36, 0.45)",
      },
      backdropBlur: {
        glass: "16px",
        "glass-xl": "24px",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;

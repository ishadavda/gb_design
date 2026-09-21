import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./shared/**/*.{ts,tsx}", "./modules/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-manrope)", "sans-serif"],
      },
      colors: {
        navy: {
          DEFAULT: "#0F172A",
          900: "#0F172A",
          hero: "#101626",
          mid: "#1E2A45",
        },
        slate: {
          DEFAULT: "#64748B",
          500: "#64748B",
          border: "#E2E8F0",
          page: "#F8FAFC",
        },
        border: {
          light: "#E2E8F0",
          dark: "#1E2A45",
        },
        cta: {
          green: "#4CAF50",
          shadow: "#33863F",
        },
        claire: "#2E7D32",
        lime: {
          DEFAULT: "#CEF646",
          mid: "#DFF88E",
        },
        alert: {
          red: "#DC2626",
        },
        gold: {
          DEFAULT: "#FFC53D",
          light: "#FFDA85",
        },
        teal: {
          DEFAULT: "#00B4D8",
          tint: "#D4EFF7",
        },
      },
    },
  },
  plugins: [],
};

export default config;

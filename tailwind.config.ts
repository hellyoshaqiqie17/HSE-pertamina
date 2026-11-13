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
        canvas: "#FAFBFC",
        surface: "#FFFFFF",
        shell: "#F1F5F9",
        pill: "#F1F5F9",
        ink: {
          primary: "#0F172A",
          secondary: "#475569",
          muted: "#64748B",
        },
        border: {
          DEFAULT: "#E2E8F0",
          subtle: "#F1F5F9",
          control: "#CBD5E1",
        },
        brand: {
          DEFAULT: "#0F172A",
          hover: "#1E293B",
          accent: "#4B6BFB",
          accentHover: "#3B5BEB",
          tint: "#EEF2FF",
        },
        info: {
          DEFAULT: "#4B6BFB",
          marker: "#3B5BEB",
          tint: "#EEF2FF",
        },
        warning: {
          DEFAULT: "#92400E",
          marker: "#F59E0B",
          tint: "#FFFBEB",
        },
        danger: {
          DEFAULT: "#B91C1C",
          button: "#DC2626",
          marker: "#EF4444",
          tint: "#FEF2F2",
        },
      },
      fontFamily: {
        sans: ["Satoshi", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        card: "16px",
        control: "10px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.03), 0 1px 6px rgba(15, 23, 42, 0.04)",
        elevated: "0 1px 3px rgba(0, 0, 0, 0.04), 0 6px 16px rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;

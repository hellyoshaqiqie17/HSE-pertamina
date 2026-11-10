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
        canvas: "#F7F7F4",
        surface: "#FFFFFF",
        shell: "#F1F1EE",
        pill: "#EFEFEA",
        ink: {
          primary: "#18181B",
          secondary: "#52525B",
          muted: "#68686F",
        },
        border: {
          DEFAULT: "#E2E2DE",
          subtle: "#E4E4E0",
          control: "#D4D4CE",
        },
        brand: {
          DEFAULT: "#18181B",
          hover: "#27272A",
          accent: "#C84B28",
          accentHover: "#A93B1D",
          tint: "#F4F4F1",
        },
        info: {
          DEFAULT: "#18181B",
          marker: "#3F3F46",
          tint: "#F4F4F5",
        },
        warning: {
          DEFAULT: "#92400E",
          marker: "#D97706",
          tint: "#F7F7F4",
        },
        danger: {
          DEFAULT: "#991B1B",
          button: "#18181B",
          marker: "#DC2626",
          tint: "#F7F7F4",
        },
      },
      fontFamily: {
        sans: ["Satoshi", "var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        card: "16px",
        control: "10px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0, 0, 0, 0.03), 0 1px 6px rgba(0, 0, 0, 0.04)",
        elevated: "0 1px 3px rgba(0, 0, 0, 0.04), 0 6px 16px rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          light: "#F5F5F7",
          dark: "#000000",
        },
        surface: {
          light: "#FFFFFF",
          dark: "#1C1C1E",
        },
        surface2: {
          light: "#F0F0F3",
          dark: "#2C2C2E",
        },
        ink: {
          light: "#0B0B0D",
          dark: "#F5F5F7",
        },
        muted: {
          light: "#6E6E76",
          dark: "#98989F",
        },
        line: {
          light: "rgba(0,0,0,0.06)",
          dark: "rgba(255,255,255,0.08)",
        },
        accent: {
          DEFAULT: "#0A84FF",
          soft: "rgba(10, 132, 255, 0.12)",
        },
        good: {
          DEFAULT: "#34C759",
          soft: "rgba(52, 199, 89, 0.14)",
        },
        warn: {
          DEFAULT: "#FF9F0A",
          soft: "rgba(255, 159, 10, 0.14)",
        },
        bad: {
          DEFAULT: "#FF453A",
          soft: "rgba(255, 69, 58, 0.14)",
        },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "28px",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)",
        "soft-dark": "0 1px 2px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.35)",
      },
      keyframes: {
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "rise-in": "rise-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};
export default config;

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
          light: "#FFFFFF",
          dark: "#000000",
        },
        surface: {
          light: "#FFFFFF",
          dark: "#161617",
        },
        surface2: {
          light: "#FAFAFB",
          dark: "#232324",
        },
        ink: {
          light: "#161618",
          dark: "#F5F5F7",
        },
        muted: {
          light: "#8A8A93",
          dark: "#909096",
        },
        line: {
          light: "rgba(0,0,0,0.045)",
          dark: "rgba(255,255,255,0.07)",
        },
        accent: {
          DEFAULT: "#0A84FF",
          soft: "rgba(10, 132, 255, 0.1)",
        },
        good: {
          DEFAULT: "#34C759",
          soft: "rgba(52, 199, 89, 0.1)",
        },
        warn: {
          DEFAULT: "#FF9F0A",
          soft: "rgba(255, 159, 10, 0.1)",
        },
        bad: {
          DEFAULT: "#FF453A",
          soft: "rgba(255, 69, 58, 0.1)",
        },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "26px",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 1px 1px rgba(0,0,0,0.02), 0 6px 20px rgba(0,0,0,0.035)",
        "soft-dark": "0 1px 1px rgba(0,0,0,0.2), 0 6px 20px rgba(0,0,0,0.3)",
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

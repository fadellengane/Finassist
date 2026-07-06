import type { CSSProperties } from "react";

/**
 * Recharts a besoin de vraies valeurs de couleur (pas de classes Tailwind).
 * Ces constantes reflètent volontairement les couleurs définies dans
 * `tailwind.config.ts` — si vous changez l'une, pensez à l'autre.
 */
export const CHART_COLORS = {
  accent: "#0A84FF",
  good: "#34C759",
  warn: "#FF9F0A",
  bad: "#FF453A",
  violet: "#5E5CE6",
  muted: "#8A8A93",
  gridLight: "rgba(0,0,0,0.06)",
  gridDark: "rgba(255,255,255,0.08)",
};

export const CHART_FONT = "var(--font-manrope), system-ui, sans-serif";

/** Tooltip Recharts stylée pour coller au design des cartes (fond, coins arrondis, ombre douce). */
export const chartTooltipStyle: CSSProperties = {
  borderRadius: 16,
  border: "none",
  boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
  fontFamily: CHART_FONT,
  fontSize: 13,
  fontWeight: 300,
  padding: "10px 14px",
};

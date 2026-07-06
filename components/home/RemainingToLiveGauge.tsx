import clsx from "clsx";
import type { RiskLevel } from "@/lib/types";
import { ATTENTION_THRESHOLD } from "@/lib/finance/engine";

const LABELS: Record<RiskLevel, string> = {
  stable: "Confortable",
  attention: "À surveiller",
  risque: "Risqué",
};

const COLORS: Record<RiskLevel, string> = {
  stable: "bg-good",
  attention: "bg-warn",
  risque: "bg-bad",
};

const TEXT_COLORS: Record<RiskLevel, string> = {
  stable: "text-good",
  attention: "text-warn",
  risque: "text-bad",
};

/**
 * Jauge à 3 zones (risqué / à surveiller / confortable). La position du
 * marqueur est calculée sur une échelle bornée à ± 2x le seuil "attention",
 * ce qui suffit à donner une intuition visuelle sans prétendre à une
 * précision qui n'aurait pas de sens ici.
 */
export function RemainingToLiveGauge({ amount, risk }: { amount: number; risk: RiskLevel }) {
  const ceiling = ATTENTION_THRESHOLD * 2;
  const floor = -ATTENTION_THRESHOLD;
  const clamped = Math.min(ceiling, Math.max(floor, amount));
  const positionPct = ((clamped - floor) / (ceiling - floor)) * 100;

  return (
    <div>
      <div className="relative h-2 w-full overflow-hidden rounded-pill bg-surface2-light dark:bg-surface2-dark">
        <div className="absolute inset-y-0 left-0 w-1/3 bg-bad/25" />
        <div className="absolute inset-y-0 left-1/3 w-1/3 bg-warn/25" />
        <div className="absolute inset-y-0 left-2/3 w-1/3 bg-good/25" />
        <div
          className={clsx(
            "absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-surface-light shadow-soft transition-all duration-500 dark:border-surface-dark",
            COLORS[risk]
          )}
          style={{ left: `${positionPct}%` }}
        />
      </div>
      <p className={clsx("mt-2 text-xs font-normal", TEXT_COLORS[risk])}>{LABELS[risk]}</p>
    </div>
  );
}

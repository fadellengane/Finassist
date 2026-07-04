import clsx from "clsx";
import type { RiskLevel } from "@/lib/types";

const RISK_META: Record<RiskLevel, { label: string; explanation: string; dot: string; bg: string; text: string }> = {
  stable: {
    label: "Stable",
    explanation: "Ta situation est saine sur la période à venir.",
    dot: "bg-good",
    bg: "bg-good-soft",
    text: "text-good",
  },
  attention: {
    label: "Attention",
    explanation: "Ta marge se resserre sur un des prochains mois.",
    dot: "bg-warn",
    bg: "bg-warn-soft",
    text: "text-warn",
  },
  risque: {
    label: "Risque",
    explanation: "Un découvert est probable si rien ne change.",
    dot: "bg-bad",
    bg: "bg-bad-soft",
    text: "text-bad",
  },
};

export function StatusBadge({ risk, withExplanation = true }: { risk: RiskLevel; withExplanation?: boolean }) {
  const meta = RISK_META[risk];
  return (
    <div className={clsx("flex items-center gap-3 rounded-2xl px-4 py-3", meta.bg)}>
      <span className={clsx("h-2.5 w-2.5 shrink-0 rounded-full", meta.dot)} />
      <div>
        <p className={clsx("text-sm font-semibold", meta.text)}>{meta.label}</p>
        {withExplanation && (
          <p className="text-xs text-muted-light dark:text-muted-dark">{meta.explanation}</p>
        )}
      </div>
    </div>
  );
}

"use client";

import type { ScenarioType } from "@/lib/types";

const SCENARIOS: { type: ScenarioType; label: string }[] = [
  { type: "achat", label: "Achat" },
  { type: "salaire", label: "Salaire" },
  { type: "abonnement_ajout", label: "Nouvel abonnement" },
  { type: "abonnement_suppression", label: "Résilier un abonnement" },
  { type: "depense_recurrente", label: "Dépense récurrente" },
  { type: "remboursement_anticipe", label: "Remboursement anticipé" },
];

export function ScenarioTypePicker({
  value,
  onChange,
}: {
  value: ScenarioType;
  onChange: (type: ScenarioType) => void;
}) {
  return (
    <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1" style={{ scrollbarWidth: "none" }}>
      {SCENARIOS.map((s) => (
        <button
          key={s.type}
          onClick={() => onChange(s.type)}
          className={`shrink-0 rounded-pill border px-4 py-2.5 text-sm font-normal transition-colors ${
            value === s.type
              ? "border-accent bg-accent-soft text-accent"
              : "border-line-light text-muted-light dark:border-line-dark dark:text-muted-dark"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

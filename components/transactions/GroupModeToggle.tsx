"use client";

import type { TransactionGroupMode } from "@/lib/types";

const OPTIONS: { mode: TransactionGroupMode; label: string }[] = [
  { mode: "day", label: "Jour" },
  { mode: "week", label: "Semaine" },
  { mode: "month", label: "Mois" },
];

export function GroupModeToggle({
  mode,
  onChange,
}: {
  mode: TransactionGroupMode;
  onChange: (mode: TransactionGroupMode) => void;
}) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map((o) => (
        <button
          key={o.mode}
          onClick={() => onChange(o.mode)}
          className={`flex-1 rounded-2xl border px-3 py-2.5 text-sm font-normal transition-colors ${
            mode === o.mode
              ? "border-accent bg-accent-soft text-accent"
              : "border-line-light text-muted-light dark:border-line-dark dark:text-muted-dark"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

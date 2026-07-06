"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Field";

const PRESETS = [3, 6, 12];

export function DurationPicker({
  months,
  onChange,
}: {
  months: number;
  onChange: (months: number) => void;
}) {
  const [customOpen, setCustomOpen] = useState(!PRESETS.includes(months));
  const [customValue, setCustomValue] = useState(String(months));

  return (
    <div>
      <div className="flex gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => {
              setCustomOpen(false);
              onChange(p);
            }}
            className={`flex-1 rounded-2xl border px-3 py-2.5 text-sm font-normal transition-colors ${
              !customOpen && months === p
                ? "border-accent bg-accent-soft text-accent"
                : "border-line-light text-muted-light dark:border-line-dark dark:text-muted-dark"
            }`}
          >
            {p} mois
          </button>
        ))}
        <button
          onClick={() => setCustomOpen(true)}
          className={`flex-1 rounded-2xl border px-3 py-2.5 text-sm font-normal transition-colors ${
            customOpen
              ? "border-accent bg-accent-soft text-accent"
              : "border-line-light text-muted-light dark:border-line-dark dark:text-muted-dark"
          }`}
        >
          Personnalisé
        </button>
      </div>

      {customOpen && (
        <div className="mt-3 flex items-center gap-3">
          <div className="w-24">
            <Input
              type="number"
              min={1}
              max={36}
              value={customValue}
              onChange={(e) => {
                setCustomValue(e.target.value);
                const n = parseInt(e.target.value, 10);
                if (n > 0 && n <= 36) onChange(n);
              }}
            />
          </div>
          <span className="text-sm font-light text-muted-light dark:text-muted-dark">mois</span>
        </div>
      )}
    </div>
  );
}

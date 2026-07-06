"use client";

import { CATEGORY_META, CATEGORY_OPTIONS } from "@/lib/finance/categories";
import type { Category } from "@/lib/types";

export function CategoryQuickFilters({
  selected,
  onToggle,
}: {
  selected: Category[];
  onToggle: (category: Category) => void;
}) {
  return (
    <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1" style={{ scrollbarWidth: "none" }}>
      {CATEGORY_OPTIONS.map((c) => {
        const active = selected.includes(c);
        const meta = CATEGORY_META[c];
        return (
          <button
            key={c}
            onClick={() => onToggle(c)}
            className={`flex shrink-0 items-center gap-1.5 rounded-pill border px-3.5 py-2 text-xs font-normal transition-colors ${
              active
                ? "border-accent bg-accent-soft text-accent"
                : "border-line-light text-muted-light dark:border-line-dark dark:text-muted-dark"
            }`}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: active ? undefined : meta.color }}
            />
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}

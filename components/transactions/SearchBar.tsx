"use client";

import { Search, X } from "lucide-react";

export function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <Search
        size={16}
        strokeWidth={1.75}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Rechercher une transaction…"
        className="w-full rounded-2xl border border-line-light bg-surface2-light py-3.5 pl-11 pr-10 text-[15px] font-light text-ink-light outline-none transition-colors focus:border-accent dark:border-line-dark dark:bg-surface2-dark dark:text-ink-dark"
      />
      {value.length > 0 && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-light dark:text-muted-dark"
          aria-label="Effacer la recherche"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

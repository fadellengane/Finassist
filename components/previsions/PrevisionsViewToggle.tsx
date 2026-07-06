"use client";

export function PrevisionsViewToggle({
  view,
  onChange,
}: {
  view: "liste" | "calendrier";
  onChange: (view: "liste" | "calendrier") => void;
}) {
  return (
    <div className="flex gap-2">
      {(["liste", "calendrier"] as const).map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`flex-1 rounded-2xl border px-3 py-2.5 text-sm font-normal capitalize transition-colors ${
            view === v
              ? "border-accent bg-accent-soft text-accent"
              : "border-line-light text-muted-light dark:border-line-dark dark:text-muted-dark"
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

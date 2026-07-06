"use client";

import { AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CATEGORY_META } from "@/lib/finance/categories";
import { formatCurrency } from "@/lib/utils/format";
import { useFinanceStore } from "@/lib/store";
import type { BudgetStatus } from "@/lib/types";

const BAR_COLOR = {
  ok: "bg-good",
  warning: "bg-warn",
  exceeded: "bg-bad",
} as const;

export function BudgetCard({ status, onEdit }: { status: BudgetStatus; onEdit: () => void }) {
  const removeBudget = useFinanceStore((s) => s.removeBudget);
  const meta = CATEGORY_META[status.budget.category];
  const pct = Math.min(100, Math.round(status.ratio * 100));

  return (
    <Card className="!p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
          <p className="text-[15px] font-normal">{meta.label}</p>
        </div>
        <div className="flex items-center gap-1">
          {status.alert !== "ok" && (
            <AlertTriangle
              size={15}
              className={status.alert === "exceeded" ? "text-bad" : "text-warn"}
              strokeWidth={1.75}
            />
          )}
          <button
            onClick={onEdit}
            className="rounded-full p-1.5 text-muted-light hover:text-accent dark:text-muted-dark"
            aria-label="Modifier le budget"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => removeBudget(status.budget.id)}
            className="rounded-full p-1.5 text-muted-light hover:text-bad dark:text-muted-dark"
            aria-label="Supprimer le budget"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="mb-3 h-2 w-full overflow-hidden rounded-pill bg-surface2-light dark:bg-surface2-dark">
        <div
          className={`h-full rounded-pill transition-all duration-500 ${BAR_COLOR[status.alert]}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="tabular font-medium">{formatCurrency(status.spent)}</span>
        <span className="font-light text-muted-light dark:text-muted-dark">
          sur {formatCurrency(status.budget.monthlyLimit)}
        </span>
      </div>
    </Card>
  );
}

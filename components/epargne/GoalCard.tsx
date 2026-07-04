"use client";

import { Trash2, PlusCircle } from "lucide-react";
import type { SavingsGoal, Transaction } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { getGoalProgress } from "@/lib/finance/goals";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { useFinanceStore } from "@/lib/store";

export function GoalCard({
  goal,
  transactions,
  onContribute,
}: {
  goal: SavingsGoal;
  transactions: Transaction[];
  onContribute: (goalId: string) => void;
}) {
  const removeGoal = useFinanceStore((s) => s.removeGoal);
  const progress = getGoalProgress(goal, transactions);
  const pct = Math.round(progress.progressRatio * 100);

  return (
    <Card className="!p-5">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-[15px] font-bold">{goal.name}</p>
          <p className="text-xs text-muted-light dark:text-muted-dark">
            Objectif pour le {formatDate(goal.targetDate)}
          </p>
        </div>
        <button
          onClick={() => removeGoal(goal.id)}
          className="rounded-full p-1.5 text-muted-light hover:text-bad dark:text-muted-dark"
          aria-label="Supprimer l'objectif"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="mb-2 h-2.5 w-full overflow-hidden rounded-pill bg-surface2-light dark:bg-surface2-dark">
        <div
          className="h-full rounded-pill bg-accent transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="tabular font-semibold">{formatCurrency(progress.currentAmount)}</span>
        <span className="text-muted-light dark:text-muted-dark">
          sur {formatCurrency(goal.targetAmount)}
        </span>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 text-xs text-muted-light dark:text-muted-dark">
        <div>
          <p className="tabular text-sm font-semibold text-ink-light dark:text-ink-dark">
            {formatCurrency(progress.remainingAmount)}
          </p>
          <p>Montant restant</p>
        </div>
        <div>
          <p className="tabular text-sm font-semibold text-ink-light dark:text-ink-dark">
            {progress.estimatedMonthsLeft !== null ? `${progress.estimatedMonthsLeft} mois` : "—"}
          </p>
          <p>Temps estimé</p>
        </div>
      </div>

      <button
        onClick={() => onContribute(goal.id)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-soft py-3 text-sm font-semibold text-accent"
      >
        <PlusCircle size={16} />
        Ajouter un versement
      </button>
    </Card>
  );
}

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { getGoalCurrentAmount } from "@/lib/finance/goals";
import { formatCurrency } from "@/lib/utils/format";
import type { SavingsGoal, Transaction } from "@/lib/types";

export function SavingsSummaryCard({
  goals,
  transactions,
}: {
  goals: SavingsGoal[];
  transactions: Transaction[];
}) {
  const total = goals.reduce((sum, g) => sum + getGoalCurrentAmount(g, transactions), 0);

  return (
    <Link href="/epargne">
      <Card className="!p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-light text-muted-light dark:text-muted-dark">Épargne totale</p>
            <p className="tabular mt-1 text-3xl font-light tracking-tight">{formatCurrency(total)}</p>
            <p className="mt-1 text-xs font-light text-muted-light dark:text-muted-dark">
              {goals.length > 0
                ? `Sur ${goals.length} objectif${goals.length > 1 ? "s" : ""}`
                : "Aucun objectif pour l'instant"}
            </p>
          </div>
          <ChevronRight size={18} className="shrink-0 text-muted-light dark:text-muted-dark" />
        </div>
      </Card>
    </Link>
  );
}

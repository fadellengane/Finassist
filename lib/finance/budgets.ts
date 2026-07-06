import type { Budget, BudgetStatus, Transaction } from "@/lib/types";
import { getTransactionsForMonth } from "@/lib/finance/engine";

const WARNING_RATIO = 0.8; // à partir de 80% du budget consommé : alerte

/** Calcule, pour un budget donné, ce qui a été dépensé ce mois-ci dans sa catégorie. */
export function getBudgetStatus(budget: Budget, transactions: Transaction[]): BudgetStatus {
  const occurrences = getTransactionsForMonth(transactions, new Date());
  const spent = occurrences
    .filter((o) => o.transaction.category === budget.category && o.transaction.flow === "expense")
    .reduce((sum, o) => sum + o.transaction.amount, 0);

  const remaining = budget.monthlyLimit - spent;
  const ratio = budget.monthlyLimit > 0 ? spent / budget.monthlyLimit : 0;

  return {
    budget,
    spent,
    remaining,
    ratio,
    alert: ratio >= 1 ? "exceeded" : ratio >= WARNING_RATIO ? "warning" : "ok",
  };
}

export function getAllBudgetStatuses(budgets: Budget[], transactions: Transaction[]): BudgetStatus[] {
  return budgets.map((b) => getBudgetStatus(b, transactions));
}

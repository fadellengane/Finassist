import type { SavingsGoal, Transaction } from "@/lib/types";
import { monthsBetween, todayISO } from "@/lib/utils/format";

export interface GoalProgress {
  goal: SavingsGoal;
  currentAmount: number;
  remainingAmount: number;
  progressRatio: number; // 0 → 1
  monthsElapsed: number;
  monthlyPace: number; // moyenne versée par mois depuis la création
  estimatedMonthsLeft: number | null; // null si aucun rythme constaté
}

export function getGoalCurrentAmount(goal: SavingsGoal, transactions: Transaction[]): number {
  return transactions
    .filter((tx) => tx.goalId === goal.id)
    .reduce((sum, tx) => sum + tx.amount, 0);
}

export function getGoalProgress(goal: SavingsGoal, transactions: Transaction[]): GoalProgress {
  const currentAmount = getGoalCurrentAmount(goal, transactions);
  const remainingAmount = Math.max(0, goal.targetAmount - currentAmount);
  const progressRatio = goal.targetAmount > 0 ? Math.min(1, currentAmount / goal.targetAmount) : 0;

  const monthsElapsed = Math.max(1, monthsBetween(goal.createdAt, todayISO()));
  const monthlyPace = currentAmount / monthsElapsed;

  const estimatedMonthsLeft =
    monthlyPace > 0 ? Math.ceil(remainingAmount / monthlyPace) : null;

  return {
    goal,
    currentAmount,
    remainingAmount,
    progressRatio,
    monthsElapsed,
    monthlyPace,
    estimatedMonthsLeft,
  };
}

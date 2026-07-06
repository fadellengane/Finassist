import type {
  Budget,
  HealthScore,
  HealthScoreExplanation,
  HealthScoreFactor,
  SavingsGoal,
  Transaction,
} from "@/lib/types";
import { getForecast, getRemainingToLive, getTransactionsForMonth } from "@/lib/finance/engine";
import { getAllBudgetStatuses } from "@/lib/finance/budgets";
import { getGoalCurrentAmount } from "@/lib/finance/goals";

/**
 * ============================================================================
 * SCORE DE SANTÉ FINANCIÈRE
 * ----------------------------------------------------------------------------
 * Moyenne pondérée de 6 sous-scores (0 à 100 chacun), volontairement simples
 * et indépendants les uns des autres — chacun peut être ajusté ou remplacé
 * sans toucher au reste. Les poids sont des constantes ci-dessous.
 * ============================================================================
 */

const WEIGHTS = {
  savings: 0.15,
  incomeRegularity: 0.1,
  expenseRatio: 0.2,
  remainingToLive: 0.2,
  overdraftRisk: 0.2,
  budgetCompliance: 0.15,
};

function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, n));
}

export function computeHealthScore(
  transactions: Transaction[],
  goals: SavingsGoal[],
  budgets: Budget[],
  startingBalance: number,
  startingBalanceDate: string
): HealthScore {
  const monthOccurrences = getTransactionsForMonth(transactions, new Date());
  const revenusMois = monthOccurrences
    .filter((o) => o.transaction.flow === "income")
    .reduce((s, o) => s + o.transaction.amount, 0);
  const depensesMois = monthOccurrences
    .filter((o) => o.transaction.flow === "expense")
    .reduce((s, o) => s + o.transaction.amount, 0);

  // 1. Épargne de sécurité (en mois de dépenses courantes)
  const totalSavings = goals.reduce((sum, g) => sum + getGoalCurrentAmount(g, transactions), 0);
  const savingsScore =
    depensesMois > 0 ? clamp((totalSavings / (depensesMois * 3)) * 100) : totalSavings > 0 ? 100 : 55;

  // 2. Régularité des revenus
  const hasRecurringIncome = transactions.some((t) => t.flow === "income" && t.recurrence === "monthly");
  const hasAnyIncome = transactions.some((t) => t.flow === "income");
  const incomeRegularityScore = hasRecurringIncome ? 100 : hasAnyIncome ? 55 : 20;

  // 3. Ratio dépenses / revenus du mois
  let expenseRatioScore: number;
  if (revenusMois <= 0) {
    expenseRatioScore = 50;
  } else {
    const ratio = depensesMois / revenusMois;
    expenseRatioScore =
      ratio <= 0.5 ? 100 : ratio <= 0.7 ? 85 : ratio <= 0.9 ? 65 : ratio <= 1 ? 45 : ratio <= 1.2 ? 25 : 10;
  }

  // 4. Reste à vivre
  const remaining = getRemainingToLive(transactions, startingBalance, startingBalanceDate);
  const remainingToLiveScore =
    remaining.risk === "stable" ? 100 : remaining.risk === "attention" ? 55 : 15;

  // 5. Risque de découvert sur les 3 prochains mois
  const forecast = getForecast(transactions, startingBalance, startingBalanceDate, 3);
  let overdraftRiskScore = 100;
  for (const m of forecast) {
    if (m.risk === "attention") overdraftRiskScore -= 15;
    if (m.risk === "risque") overdraftRiskScore -= 35;
  }
  overdraftRiskScore = clamp(overdraftRiskScore);

  // 6. Respect des budgets
  const budgetStatuses = getAllBudgetStatuses(budgets, transactions);
  const budgetComplianceScore =
    budgetStatuses.length === 0
      ? 70
      : clamp(
          budgetStatuses.reduce(
            (sum, b) => sum + (b.alert === "ok" ? 100 : b.alert === "warning" ? 60 : 20),
            0
          ) / budgetStatuses.length
        );

  const factors: HealthScoreFactor[] = [
    { key: "savings", label: "Épargne de sécurité", score: savingsScore, weight: WEIGHTS.savings },
    { key: "incomeRegularity", label: "Régularité des revenus", score: incomeRegularityScore, weight: WEIGHTS.incomeRegularity },
    { key: "expenseRatio", label: "Maîtrise des dépenses", score: expenseRatioScore, weight: WEIGHTS.expenseRatio },
    { key: "remainingToLive", label: "Reste à vivre", score: remainingToLiveScore, weight: WEIGHTS.remainingToLive },
    { key: "overdraftRisk", label: "Risque de découvert", score: overdraftRiskScore, weight: WEIGHTS.overdraftRisk },
    { key: "budgetCompliance", label: "Respect des budgets", score: budgetComplianceScore, weight: WEIGHTS.budgetCompliance },
  ];

  const score = Math.round(factors.reduce((sum, f) => sum + f.score * f.weight, 0));

  // Explications qualitatives (indépendantes de la pondération, pensées pour être lisibles)
  const explanations: HealthScoreExplanation[] = [];

  if (savingsScore >= 75) {
    explanations.push({ tone: "good", text: "Bonne capacité d'épargne" });
  } else if (savingsScore < 40) {
    explanations.push({ tone: "warning", text: "Ton épargne de sécurité est encore faible" });
  }

  const restaurationMois = monthOccurrences
    .filter((o) => o.transaction.category === "restauration" && o.transaction.flow === "expense")
    .reduce((s, o) => s + o.transaction.amount, 0);
  if (restaurationMois > 100) {
    explanations.push({ tone: "warning", text: "Beaucoup de dépenses en restauration" });
  }

  const abonnementsActifs = transactions.filter((t) => t.type === "abonnement").length;
  if (abonnementsActifs >= 3) {
    explanations.push({ tone: "warning", text: "Plusieurs abonnements actifs" });
  }

  if (overdraftRiskScore < 60) {
    explanations.push({ tone: "warning", text: "Risque de découvert sur les prochains mois" });
  } else if (remainingToLiveScore === 100 && expenseRatioScore >= 85) {
    explanations.push({ tone: "good", text: "Situation confortable ce mois-ci" });
  }

  if (budgetStatuses.length > 0) {
    const hasExceeded = budgetStatuses.some((b) => b.alert === "exceeded");
    if (hasExceeded) {
      explanations.push({ tone: "warning", text: "Un ou plusieurs budgets sont dépassés" });
    } else if (budgetComplianceScore >= 90) {
      explanations.push({ tone: "good", text: "Tu respectes bien tes budgets" });
    }
  }

  return { score, factors, explanations };
}

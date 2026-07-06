import type { Budget, Category, SavingsGoal, Transaction } from "@/lib/types";
import { CATEGORY_META } from "@/lib/finance/categories";
import { getAllBudgetStatuses } from "@/lib/finance/budgets";
import { getForecast } from "@/lib/finance/engine";
import { getGoalProgress } from "@/lib/finance/goals";
import { todayISO } from "@/lib/utils/format";

export interface CoachTip {
  id: string;
  title: string;
  detail: string;
}

/**
 * ============================================================================
 * COACH FINANCIER
 * ----------------------------------------------------------------------------
 * Reste un moteur de règles (pas de modèle prédictif), mais volontairement
 * plus contextuel : il croise dépenses, budgets, objectifs et prévisions au
 * lieu de ne regarder qu'une seule dimension à la fois. Chaque règle est
 * indépendante et peut être retirée/ajustée sans affecter les autres.
 * ============================================================================
 */

function monthlySpendByCategory(transactions: Transaction[], category: Category): number {
  const today = new Date(todayISO() + "T00:00:00");
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const fromISO = thirtyDaysAgo.toISOString().slice(0, 10);

  return transactions
    .filter((tx) => tx.category === category && tx.flow === "expense" && tx.date >= fromISO && tx.date <= todayISO())
    .reduce((sum, tx) => sum + tx.amount, 0);
}

export function generateCoachTips(
  transactions: Transaction[],
  goals: SavingsGoal[] = [],
  budgets: Budget[] = [],
  startingBalance = 0,
  startingBalanceDate = todayISO()
): CoachTip[] {
  const tips: CoachTip[] = [];
  const budgetStatuses = getAllBudgetStatuses(budgets, transactions);

  // 1. Restauration — s'appuie sur le budget réel s'il existe, sinon sur une estimation générique
  const restaurationBudget = budgetStatuses.find((b) => b.budget.category === "restauration");
  const restauration = monthlySpendByCategory(transactions, "restauration");
  if (restaurationBudget && restaurationBudget.alert !== "ok") {
    const pct = Math.round(restaurationBudget.ratio * 100);
    tips.push({
      id: "restauration-budget",
      title: `Ton budget restauration est ${restaurationBudget.alert === "exceeded" ? "dépassé" : `déjà à ${pct} %`}.`,
      detail:
        restaurationBudget.alert === "exceeded"
          ? `${Math.round(restaurationBudget.spent)} € dépensés pour un budget de ${restaurationBudget.budget.monthlyLimit} €.`
          : `Il te reste ${Math.round(restaurationBudget.remaining)} € pour finir le mois sereinement.`,
    });
  } else if (restauration > 0) {
    const monthlySaving = Math.round(restauration * 0.2);
    const yearly = monthlySaving * 12;
    tips.push({
      id: "restauration",
      title: `Tu pourrais économiser environ ${monthlySaving} € par mois en réduisant les restaurants.`,
      detail: `Soit environ ${yearly} € par an, pour 20 % de moins sur cette catégorie.`,
    });
  }

  // 2. Abonnements multiples
  const abonnements = transactions.filter((tx) => tx.type === "abonnement" && tx.flow === "expense");
  const uniqueAbonnements = Array.from(new Map(abonnements.map((a) => [a.name, a])).values());
  if (uniqueAbonnements.length >= 2) {
    const totalMonthly = uniqueAbonnements.reduce((sum, a) => sum + a.amount, 0);
    const potentialYearly = Math.round((totalMonthly / uniqueAbonnements.length) * 12);
    tips.push({
      id: "abonnements",
      title: `Tu paies ${uniqueAbonnements.length} abonnements différents.`,
      detail: `Tu pourrais économiser environ ${potentialYearly} € par an en en supprimant un seul.`,
    });
  }

  // 3. Loisirs élevés
  const loisirs = monthlySpendByCategory(transactions, "loisirs");
  if (loisirs > 150) {
    tips.push({
      id: "loisirs",
      title: `Tes dépenses loisirs dépassent 150 € ce mois-ci (${Math.round(loisirs)} €).`,
      detail: "Un petit ajustement ici aurait un impact rapide sur ta marge disponible.",
    });
  }

  // 4. Accélérer un objectif d'épargne
  for (const goal of goals) {
    const progress = getGoalProgress(goal, transactions);
    if (progress.monthlyPace <= 0 || progress.remainingAmount <= 0) continue;

    const extra = Math.max(20, Math.round(progress.monthlyPace * 0.25));
    const acceleratedMonths = Math.ceil(progress.remainingAmount / (progress.monthlyPace + extra));
    const monthsSaved = (progress.estimatedMonthsLeft ?? acceleratedMonths) - acceleratedMonths;

    if (monthsSaved >= 1) {
      tips.push({
        id: `goal-${goal.id}`,
        title: `Tu pourrais atteindre « ${goal.name} » ${monthsSaved} mois plus tôt.`,
        detail: `En mettant ${extra} € de plus chaque mois sur cet objectif.`,
      });
      break; // un seul conseil d'épargne à la fois, pour ne pas surcharger
    }
  }

  // 5. Mois à risque à venir — suggère de décaler les prochains achats
  const forecast = getForecast(transactions, startingBalance, startingBalanceDate, 3);
  const tenseMonth = forecast.find((m) => m.risk !== "stable");
  if (tenseMonth) {
    tips.push({
      id: "tense-month",
      title: `${tenseMonth.monthLabel} s'annonce ${tenseMonth.risk === "risque" ? "difficile" : "juste"}.`,
      detail: "Décaler tes prochains achats non essentiels de quelques semaines peut suffire à repasser au vert.",
    });
  }

  // 6. Aucune épargne enregistrée du tout
  const hasSavings = transactions.some((tx) => tx.category === "epargne");
  if (!hasSavings) {
    tips.push({
      id: "no-savings",
      title: "Tu n'as pas encore commencé à épargner ce mois-ci.",
      detail: "Même un petit virement régulier fait une vraie différence sur la durée.",
    });
  }

  if (tips.length === 0) {
    tips.push({
      id: "empty",
      title: "Pas encore assez de données.",
      detail: "Ajoute quelques transactions pour recevoir des conseils personnalisés.",
    });
  }

  return tips;
}

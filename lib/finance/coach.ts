import type { Category, Transaction } from "@/lib/types";
import { CATEGORY_META } from "@/lib/finance/categories";
import { todayISO } from "@/lib/utils/format";

export interface CoachTip {
  id: string;
  title: string;
  detail: string;
}

function monthlySpendByCategory(transactions: Transaction[], category: Category): number {
  const today = new Date(todayISO() + "T00:00:00");
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const fromISO = thirtyDaysAgo.toISOString().slice(0, 10);

  return transactions
    .filter((tx) => tx.category === category && tx.flow === "expense" && tx.date >= fromISO && tx.date <= todayISO())
    .reduce((sum, tx) => sum + tx.amount, 0);
}

export function generateCoachTips(transactions: Transaction[]): CoachTip[] {
  const tips: CoachTip[] = [];

  // 1. Restauration
  const restauration = monthlySpendByCategory(transactions, "restauration");
  if (restauration > 0) {
    const yearly = Math.round(restauration * 12 * 0.2);
    tips.push({
      id: "restauration",
      title: `Tu dépenses ${Math.round(restauration)} € par mois en ${CATEGORY_META.restauration.label.toLowerCase()}.`,
      detail: `En réduisant de 20 %, tu économiserais environ ${yearly} € par an.`,
    });
  }

  // 2. Abonnements multiples
  const abonnements = transactions.filter(
    (tx) => tx.type === "abonnement" && tx.flow === "expense"
  );
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

  // 4. Aucune épargne enregistrée
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

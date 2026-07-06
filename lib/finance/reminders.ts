import type { Reminder, SavingsGoal, Transaction } from "@/lib/types";
import { getForecast, getTransactionsForMonth } from "@/lib/finance/engine";
import { getGoalCurrentAmount } from "@/lib/finance/goals";
import { addMonths, formatCurrency, formatDateShort, todayISO } from "@/lib/utils/format";

/**
 * ============================================================================
 * RAPPELS INTELLIGENTS
 * ----------------------------------------------------------------------------
 * Moteur de règles, volontairement simple et isolé (à l'image de
 * `coach.ts`). Il ne fait qu'analyser l'état actuel — aucune notification
 * n'est déclenchée ici. Le déclenchement réel (Notification API / push PWA)
 * vit dans `lib/notifications.ts` et consomme la liste retournée ici.
 * ============================================================================
 */

const UPCOMING_WINDOW_DAYS = 7;
const STALLED_GOAL_DAYS = 30;

function isoInDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function generateReminders(
  transactions: Transaction[],
  goals: SavingsGoal[],
  startingBalance: number,
  startingBalanceDate: string
): Reminder[] {
  const reminders: Reminder[] = [];
  const today = todayISO();
  const windowEnd = isoInDays(UPCOMING_WINDOW_DAYS);

  // Occurrences des 7 prochains jours : le mois courant peut ne pas suffire
  // si on est en fin de mois, donc on couvre aussi le mois suivant.
  const now = new Date();
  const occurrencesThisMonth = getTransactionsForMonth(transactions, now);
  const occurrencesNextMonth = getTransactionsForMonth(transactions, addMonths(now, 1));
  const upcoming = [...occurrencesThisMonth, ...occurrencesNextMonth].filter(
    (o) => o.occurrenceDate >= today && o.occurrenceDate <= windowEnd
  );

  // 1. Abonnements qui arrivent bientôt
  for (const { transaction, occurrenceDate } of upcoming) {
    if (transaction.type === "abonnement") {
      reminders.push({
        id: `abo-${transaction.id}-${occurrenceDate}`,
        type: "abonnement",
        title: `${transaction.name} sera prélevé bientôt`,
        detail: `${formatCurrency(transaction.amount)} le ${formatDateShort(occurrenceDate)}.`,
        severity: "info",
        date: occurrenceDate,
      });
    }
  }

  // 2. Échéances de paiement en plusieurs fois qui approchent
  for (const { transaction, occurrenceDate } of upcoming) {
    if (transaction.installment) {
      reminders.push({
        id: `ech-${transaction.id}-${occurrenceDate}`,
        type: "echeance",
        title: `Échéance ${transaction.installment.installmentIndex}/${transaction.installment.totalInstallments} — ${transaction.name}`,
        detail: `${formatCurrency(transaction.amount)} prélevé le ${formatDateShort(occurrenceDate)}.`,
        severity: "info",
        date: occurrenceDate,
      });
    }
  }

  // 3. Mois à risque dans les 3 prochains mois
  const forecast = getForecast(transactions, startingBalance, startingBalanceDate, 3);
  for (const month of forecast) {
    if (month.risk !== "stable") {
      reminders.push({
        id: `risque-${month.monthKey}`,
        type: "risque",
        title:
          month.risk === "risque"
            ? `Découvert probable en ${month.monthLabel.toLowerCase()}`
            : `Marge serrée en ${month.monthLabel.toLowerCase()}`,
        detail: `Solde de fin de mois estimé : ${formatCurrency(month.soldeFinal)}.`,
        severity: month.risk === "risque" ? "danger" : "warning",
      });
    }
  }

  // 4. Objectifs d'épargne à l'arrêt
  for (const goal of goals) {
    const goalTransactions = transactions
      .filter((t) => t.goalId === goal.id)
      .sort((a, b) => (a.date > b.date ? -1 : 1));

    const lastContribution = goalTransactions[0]?.date ?? goal.createdAt;
    const daysSince = Math.round(
      (new Date(today + "T00:00:00").getTime() - new Date(lastContribution + "T00:00:00").getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const currentAmount = getGoalCurrentAmount(goal, transactions);
    const alreadyComplete = currentAmount >= goal.targetAmount;

    if (!alreadyComplete && daysSince >= STALLED_GOAL_DAYS) {
      reminders.push({
        id: `epargne-${goal.id}`,
        type: "epargne_stagnante",
        title: `« ${goal.name} » n'avance plus`,
        detail: `Aucun versement depuis ${daysSince} jours.`,
        severity: "warning",
      });
    }
  }

  const severityOrder: Record<Reminder["severity"], number> = { danger: 0, warning: 1, info: 2 };
  return reminders.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

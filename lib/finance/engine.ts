import type { MonthForecast, RiskLevel, SimulationResult, Transaction } from "@/lib/types";
import { addMonths, daysBetween, monthKey, monthLabel, monthsBetween, todayISO } from "@/lib/utils/format";
import { generateId } from "@/lib/utils/id";

/**
 * ============================================================================
 * HYPOTHÈSES DE CALCUL (V1)
 * ----------------------------------------------------------------------------
 * - Les transactions "mensuelles" sont supposées se répéter le même jour du
 *   mois ; on compte les occurrences au niveau du mois (pas au jour près).
 * - Les transactions "hebdomadaires" sont approximées à 4 occurrences/mois.
 * - Le "solde de référence" (startingBalance / startingBalanceDate) est le
 *   point d'ancrage : tout ce qui se passe après cette date est recalculé à
 *   partir des transactions enregistrées.
 * - Ce ne sont pas des calculs bancaires certifiés : c'est un simulateur
 *   personnel, pensé pour donner une intuition fiable, pas un relevé exact.
 * ============================================================================
 */

export const ATTENTION_THRESHOLD = 300; // en dessous : orange
export const SAFE_SPEND_BUFFER_RATIO = 0.15; // marge de sécurité gardée de côté

/** Nombre d'occurrences d'une transaction récurrente entre deux dates (from exclusif, to inclusif). */
function occurrencesBetween(tx: Transaction, fromISO: string, toISO: string): number {
  if (toISO < tx.date) return 0;

  if (tx.recurrence === "none") {
    return tx.date > fromISO && tx.date <= toISO ? 1 : 0;
  }

  if (tx.recurrence === "monthly") {
    const totalToEnd = monthsBetween(tx.date, toISO) + 1;
    const totalToFrom = fromISO >= tx.date ? monthsBetween(tx.date, fromISO) + 1 : 0;
    return Math.max(0, totalToEnd - totalToFrom);
  }

  if (tx.recurrence === "yearly") {
    const txDate = new Date(tx.date + "T00:00:00");
    const from = new Date(fromISO + "T00:00:00");
    const to = new Date(toISO + "T00:00:00");
    let count = 0;
    for (let y = txDate.getFullYear(); y <= to.getFullYear(); y++) {
      const anniversary = new Date(y, txDate.getMonth(), txDate.getDate());
      const anniversaryISO = anniversary.toISOString().slice(0, 10);
      if (anniversaryISO > fromISO && anniversaryISO <= toISO && anniversaryISO >= tx.date) {
        count++;
      }
    }
    return count;
  }

  if (tx.recurrence === "weekly") {
    const effectiveFrom = fromISO > tx.date ? fromISO : tx.date;
    if (effectiveFrom > toISO) return 0;
    const days = daysBetween(effectiveFrom, toISO);
    return Math.max(0, Math.floor(days / 7));
  }

  return 0;
}

function flowBetween(transactions: Transaction[], fromISO: string, toISO: string) {
  let revenus = 0;
  let depenses = 0;
  let installments = 0;
  let epargne = 0;

  for (const tx of transactions) {
    const occ = occurrencesBetween(tx, fromISO, toISO);
    if (occ === 0) continue;
    const total = tx.amount * occ;

    if (tx.flow === "income") {
      revenus += total;
    } else if (tx.installment) {
      installments += total;
    } else if (tx.category === "epargne") {
      epargne += total;
    } else {
      depenses += total;
    }
  }

  return { revenus, depenses, installments, epargne };
}

export function getCurrentBalance(
  transactions: Transaction[],
  startingBalance: number,
  startingBalanceDate: string
): number {
  const today = todayISO();
  const { revenus, depenses, installments, epargne } = flowBetween(
    transactions,
    startingBalanceDate,
    today > startingBalanceDate ? today : startingBalanceDate
  );
  return startingBalance + revenus - depenses - installments - epargne;
}

export function riskFromBalance(balance: number): RiskLevel {
  if (balance < 0) return "risque";
  if (balance < ATTENTION_THRESHOLD) return "attention";
  return "stable";
}

export function getForecast(
  transactions: Transaction[],
  startingBalance: number,
  startingBalanceDate: string,
  months = 3
): MonthForecast[] {
  const today = new Date();
  let runningBalance = getCurrentBalance(transactions, startingBalance, startingBalanceDate);
  let cursorISO = todayISO();

  const result: MonthForecast[] = [];

  for (let i = 0; i < months; i++) {
    const monthDate = addMonths(today, i);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    const monthEndISO = monthEnd.toISOString().slice(0, 10);

    const { revenus, depenses, installments, epargne } = flowBetween(
      transactions,
      cursorISO,
      monthEndISO
    );

    const netFlow = revenus - depenses - installments - epargne;
    runningBalance += netFlow;

    result.push({
      monthKey: monthKey(monthDate),
      monthLabel: monthLabel(monthDate),
      revenus,
      depenses,
      installments,
      epargne,
      soldeFinal: runningBalance,
      risk: riskFromBalance(runningBalance),
    });

    cursorISO = monthEndISO;
  }

  return result;
}

/** Montant qu'il est raisonnable de dépenser maintenant, sans mettre en péril les 30 prochains jours. */
export function getSafeToSpend(
  transactions: Transaction[],
  startingBalance: number,
  startingBalanceDate: string
): number {
  const currentBalance = getCurrentBalance(transactions, startingBalance, startingBalanceDate);
  const today = todayISO();
  const in30Days = new Date();
  in30Days.setDate(in30Days.getDate() + 30);
  const in30ISO = in30Days.toISOString().slice(0, 10);

  const { depenses, installments, epargne } = flowBetween(transactions, today, in30ISO);
  const committedOutflows = depenses + installments + epargne;
  const buffer = Math.max(0, currentBalance) * SAFE_SPEND_BUFFER_RATIO;

  return Math.max(0, currentBalance - committedOutflows - buffer);
}

/** Solde après déduction de tous les engagements connus du mois en cours. */
export function getBalanceAfterCommitments(
  transactions: Transaction[],
  startingBalance: number,
  startingBalanceDate: string
): number {
  const forecast = getForecast(transactions, startingBalance, startingBalanceDate, 1);
  return forecast[0]?.soldeFinal ?? getCurrentBalance(transactions, startingBalance, startingBalanceDate);
}

interface SimulateInput {
  name: string;
  price: number;
  installmentsCount: number; // 1 = comptant
  startDate: string;
}

export function buildInstallmentTransactions(input: SimulateInput): Transaction[] {
  const groupId = generateId("sim");
  const count = Math.max(1, input.installmentsCount);
  const base = Math.floor((input.price / count) * 100) / 100;
  const rounding = Math.round((input.price - base * count) * 100) / 100;

  const transactions: Transaction[] = [];
  for (let i = 0; i < count; i++) {
    const date = addMonths(new Date(input.startDate + "T00:00:00"), i)
      .toISOString()
      .slice(0, 10);
    transactions.push({
      id: generateId("virtual"),
      name: input.name || "Simulation",
      type: "achat_ponctuel",
      category: "loisirs",
      flow: "expense",
      amount: i === count - 1 ? base + rounding : base,
      date,
      recurrence: "none",
      installment: count > 1 ? { groupId, installmentIndex: i + 1, totalInstallments: count } : undefined,
    });
  }
  return transactions;
}

export function simulatePurchase(
  input: SimulateInput,
  existingTransactions: Transaction[],
  startingBalance: number,
  startingBalanceDate: string
): SimulationResult {
  const virtualTransactions = buildInstallmentTransactions(input);
  const combined = [...existingTransactions, ...virtualTransactions];

  const forecast = getForecast(combined, startingBalance, startingBalanceDate, 3);
  const worst = forecast.reduce((min, m) => (m.soldeFinal < min.soldeFinal ? m : min), forecast[0]);

  const risk = worst.risk;
  const soutenable = risk === "stable";

  let message = "";
  if (risk === "stable") {
    message = "🟢 Oui, cet achat est soutenable.";
  } else if (risk === "attention") {
    message = `🟠 Tu seras très juste en ${worst.monthLabel.toLowerCase()}.`;
  } else {
    message = `🔴 Tu risques un découvert en ${worst.monthLabel.toLowerCase()}.`;
  }

  return {
    soutenable,
    risk,
    message,
    worstMonthLabel: worst.monthLabel,
    minBalance: worst.soldeFinal,
    margin: worst.soldeFinal,
    forecast,
  };
}

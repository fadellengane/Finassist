import type {
  MonthForecast,
  MonthOccurrence,
  RemainingToLive,
  RiskLevel,
  SimulationResult,
  Transaction,
} from "@/lib/types";
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

/** Reconstruit un objet Date (1er du mois) à partir d'une clé "YYYY-MM". */
export function dateFromMonthKey(key: string): Date {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

/**
 * Liste les occurrences concrètes d'une transaction au sein d'un mois donné,
 * avec une date d'occurrence calculée (utile pour l'affichage détaillé d'un
 * mois de prévision — contrairement à `flowBetween`, qui ne fait que sommer).
 */
export function getTransactionsForMonth(
  transactions: Transaction[],
  monthDate: Date
): MonthOccurrence[] {
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const startISO = monthStart.toISOString().slice(0, 10);
  const endISO = monthEnd.toISOString().slice(0, 10);
  const lastDay = monthEnd.getDate();

  const results: MonthOccurrence[] = [];

  for (const tx of transactions) {
    const txDate = new Date(tx.date + "T00:00:00");
    const txMonthStart = new Date(txDate.getFullYear(), txDate.getMonth(), 1);

    if (tx.recurrence === "none") {
      if (tx.date >= startISO && tx.date <= endISO) {
        results.push({ transaction: tx, occurrenceDate: tx.date });
      }
      continue;
    }

    if (tx.recurrence === "monthly") {
      if (txMonthStart <= monthStart) {
        const day = Math.min(txDate.getDate(), lastDay);
        const occDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
          .toISOString()
          .slice(0, 10);
        results.push({ transaction: tx, occurrenceDate: occDate });
      }
      continue;
    }

    if (tx.recurrence === "yearly") {
      if (txDate.getMonth() === monthDate.getMonth() && monthDate.getFullYear() >= txDate.getFullYear()) {
        const day = Math.min(txDate.getDate(), lastDay);
        const occDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
          .toISOString()
          .slice(0, 10);
        if (occDate >= tx.date) {
          results.push({ transaction: tx, occurrenceDate: occDate });
        }
      }
      continue;
    }

    if (tx.recurrence === "weekly") {
      if (txDate > monthEnd) continue;
      const cursor = new Date(Math.max(txDate.getTime(), monthStart.getTime()));
      const diffDays = Math.round((cursor.getTime() - txDate.getTime()) / 86400000);
      const offset = diffDays % 7;
      if (offset !== 0) cursor.setDate(cursor.getDate() + (7 - offset));
      while (cursor <= monthEnd) {
        results.push({ transaction: tx, occurrenceDate: cursor.toISOString().slice(0, 10) });
        cursor.setDate(cursor.getDate() + 7);
      }
      continue;
    }
  }

  return results.sort((a, b) => a.occurrenceDate.localeCompare(b.occurrenceDate));
}

export function getBalanceAfterCommitments(
  transactions: Transaction[],
  startingBalance: number,
  startingBalanceDate: string
): number {
  const forecast = getForecast(transactions, startingBalance, startingBalanceDate, 1);
  return forecast[0]?.soldeFinal ?? getCurrentBalance(transactions, startingBalance, startingBalanceDate);
}

/**
 * "Reste à vivre" — vision resserrée sur le mois en cours, complémentaire de
 * l'accueil : combien est réellement rentré/sorti ce mois-ci (occurrences
 * réelles via `getTransactionsForMonth`), et ce qu'il reste jusqu'à la fin
 * du mois compte tenu des engagements déjà connus.
 */
export function getRemainingToLive(
  transactions: Transaction[],
  startingBalance: number,
  startingBalanceDate: string
): RemainingToLive {
  const now = new Date();
  const occurrences = getTransactionsForMonth(transactions, now);

  let revenusMois = 0;
  let depensesMois = 0;
  for (const { transaction } of occurrences) {
    if (transaction.flow === "income") revenusMois += transaction.amount;
    else depensesMois += transaction.amount;
  }

  const soldeActuel = getCurrentBalance(transactions, startingBalance, startingBalanceDate);
  const disponibleFinMois = getBalanceAfterCommitments(transactions, startingBalance, startingBalanceDate);
  const depensesRestantes = Math.max(0, soldeActuel - disponibleFinMois);

  return {
    soldeActuel,
    revenusMois,
    depensesMois,
    depensesRestantes,
    disponibleFinMois,
    risk: riskFromBalance(disponibleFinMois),
  };
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

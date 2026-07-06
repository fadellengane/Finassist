import type { Transaction, TransactionGroup, TransactionGroupMode } from "@/lib/types";
import { formatDate, monthLabel } from "@/lib/utils/format";

/** Lundi de la semaine ISO contenant cette date. */
function getWeekStart(dateISO: string): Date {
  const d = new Date(dateISO + "T00:00:00");
  const day = d.getDay(); // 0 = dimanche
  const diff = day === 0 ? -6 : 1 - day; // ramène au lundi
  d.setDate(d.getDate() + diff);
  return d;
}

function getPeriodKeyAndLabel(dateISO: string, mode: TransactionGroupMode): { key: string; label: string } {
  if (mode === "day") {
    return { key: dateISO, label: formatDate(dateISO) };
  }

  if (mode === "week") {
    const start = getWeekStart(dateISO);
    const key = start.toISOString().slice(0, 10);
    const label = `Semaine du ${formatDate(key)}`;
    return { key, label };
  }

  // month
  const d = new Date(dateISO + "T00:00:00");
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  return { key, label: monthLabel(d) };
}

/**
 * Regroupe les transactions (déjà triées, idéalement par date décroissante)
 * par jour, semaine ou mois. Chaque groupe conserve l'ordre d'apparition des
 * transactions qui l'alimentent — trier la liste en amont suffit donc à
 * obtenir des groupes triés.
 */
export function groupTransactions(
  transactions: Transaction[],
  mode: TransactionGroupMode
): TransactionGroup[] {
  const order: string[] = [];
  const groups = new Map<string, TransactionGroup>();

  for (const tx of transactions) {
    const { key, label } = getPeriodKeyAndLabel(tx.date, mode);
    let group = groups.get(key);
    if (!group) {
      group = { key, label, items: [], totalIncome: 0, totalExpense: 0 };
      groups.set(key, group);
      order.push(key);
    }
    group.items.push(tx);
    if (tx.flow === "income") group.totalIncome += tx.amount;
    else group.totalExpense += tx.amount;
  }

  return order.map((key) => groups.get(key)!);
}

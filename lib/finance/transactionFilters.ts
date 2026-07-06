import type { Transaction, TransactionFilters } from "@/lib/types";

export const EMPTY_FILTERS: TransactionFilters = {
  keyword: "",
  categories: [],
  types: [],
  minAmount: null,
  maxAmount: null,
  dateFrom: null,
  dateTo: null,
};

export function hasActiveFilters(filters: TransactionFilters): boolean {
  return (
    filters.keyword.trim().length > 0 ||
    filters.categories.length > 0 ||
    filters.types.length > 0 ||
    filters.minAmount !== null ||
    filters.maxAmount !== null ||
    filters.dateFrom !== null ||
    filters.dateTo !== null
  );
}

export function countActiveFilters(filters: TransactionFilters): number {
  let count = 0;
  if (filters.categories.length > 0) count++;
  if (filters.types.length > 0) count++;
  if (filters.minAmount !== null || filters.maxAmount !== null) count++;
  if (filters.dateFrom !== null || filters.dateTo !== null) count++;
  return count;
}

/** Applique tous les critères combinés (recherche + filtres) à la liste de transactions. */
export function filterTransactions(transactions: Transaction[], filters: TransactionFilters): Transaction[] {
  const keyword = filters.keyword.trim().toLowerCase();

  return transactions.filter((tx) => {
    if (keyword) {
      const haystack = `${tx.name} ${tx.note ?? ""}`.toLowerCase();
      if (!haystack.includes(keyword)) return false;
    }

    if (filters.categories.length > 0 && !filters.categories.includes(tx.category)) return false;
    if (filters.types.length > 0 && !filters.types.includes(tx.type)) return false;

    if (filters.minAmount !== null && tx.amount < filters.minAmount) return false;
    if (filters.maxAmount !== null && tx.amount > filters.maxAmount) return false;

    if (filters.dateFrom !== null && tx.date < filters.dateFrom) return false;
    if (filters.dateTo !== null && tx.date > filters.dateTo) return false;

    return true;
  });
}

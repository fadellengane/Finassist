"use client";

import { useEffect, useState } from "react";
import type { MonthForecast, Transaction } from "@/lib/types";
import { Sheet } from "@/components/ui/Sheet";
import { CATEGORY_META } from "@/lib/finance/categories";
import { formatCurrency, formatDateShort } from "@/lib/utils/format";
import { dateFromMonthKey, getTransactionsForMonth } from "@/lib/finance/engine";

export function MonthDetailSheet({
  month,
  transactions,
  onClose,
}: {
  month: MonthForecast | null;
  transactions: Transaction[];
  onClose: () => void;
}) {
  const [displayMonth, setDisplayMonth] = useState<MonthForecast | null>(month);

  useEffect(() => {
    if (month) setDisplayMonth(month);
  }, [month]);

  const occurrences = displayMonth
    ? getTransactionsForMonth(transactions, dateFromMonthKey(displayMonth.monthKey))
    : [];

  return (
    <Sheet open={month !== null} onClose={onClose} title={displayMonth?.monthLabel ?? ""}>
      {displayMonth && (
        <div>
          <div className="mb-5 flex items-baseline justify-between rounded-2xl bg-surface2-light px-4 py-4 dark:bg-surface2-dark">
            <span className="text-sm font-light text-muted-light dark:text-muted-dark">
              Solde de fin de mois
            </span>
            <span className="tabular text-lg font-medium">{formatCurrency(displayMonth.soldeFinal)}</span>
          </div>

          {occurrences.length === 0 ? (
            <p className="py-6 text-center text-sm font-light text-muted-light dark:text-muted-dark">
              Aucune transaction connue sur ce mois.
            </p>
          ) : (
            <div className="max-h-[50vh] overflow-y-auto">
              {occurrences.map(({ transaction, occurrenceDate }, i) => {
                const meta = CATEGORY_META[transaction.category];
                const sign = transaction.flow === "income" ? "+" : "−";
                return (
                  <div
                    key={`${transaction.id}-${occurrenceDate}-${i}`}
                    className="flex items-center justify-between border-b border-line-light py-3.5 last:border-none dark:border-line-dark"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: meta.color }}
                      />
                      <div>
                        <p className="text-sm font-normal">{transaction.name}</p>
                        <p className="text-xs font-light text-muted-light dark:text-muted-dark">
                          {meta.label} · {formatDateShort(occurrenceDate)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`tabular text-sm font-medium ${
                        transaction.flow === "income" ? "text-good" : ""
                      }`}
                    >
                      {sign} {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}

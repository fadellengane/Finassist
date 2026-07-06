"use client";

import { useEffect, useState } from "react";
import type { MonthOccurrence } from "@/lib/types";
import { Sheet } from "@/components/ui/Sheet";
import { CATEGORY_META } from "@/lib/finance/categories";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export function DayDetailSheet({
  date,
  occurrences,
  onClose,
}: {
  date: string | null;
  occurrences: MonthOccurrence[];
  onClose: () => void;
}) {
  const [displayDate, setDisplayDate] = useState<string | null>(date);

  useEffect(() => {
    if (date) setDisplayDate(date);
  }, [date]);

  const dayOccurrences = displayDate
    ? occurrences.filter((o) => o.occurrenceDate === displayDate)
    : [];

  const total = dayOccurrences.reduce(
    (sum, o) => sum + (o.transaction.flow === "income" ? o.transaction.amount : -o.transaction.amount),
    0
  );

  return (
    <Sheet open={date !== null} onClose={onClose} title={displayDate ? formatDate(displayDate) : ""}>
      {displayDate && (
        <div>
          {dayOccurrences.length === 0 ? (
            <p className="py-6 text-center text-sm font-light text-muted-light dark:text-muted-dark">
              Aucun évènement financier ce jour-là.
            </p>
          ) : (
            <>
              <div className="mb-5 flex items-baseline justify-between rounded-2xl bg-surface2-light px-4 py-4 dark:bg-surface2-dark">
                <span className="text-sm font-light text-muted-light dark:text-muted-dark">
                  Mouvement net du jour
                </span>
                <span className={`tabular text-lg font-medium ${total >= 0 ? "text-good" : ""}`}>
                  {total >= 0 ? "+" : ""}
                  {formatCurrency(total)}
                </span>
              </div>

              <div>
                {dayOccurrences.map(({ transaction }, i) => {
                  const meta = CATEGORY_META[transaction.category];
                  const sign = transaction.flow === "income" ? "+" : "−";
                  return (
                    <div
                      key={`${transaction.id}-${i}`}
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
                            {meta.label}
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
            </>
          )}
        </div>
      )}
    </Sheet>
  );
}

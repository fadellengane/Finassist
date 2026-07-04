"use client";

import { Trash2 } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { CATEGORY_META } from "@/lib/finance/categories";
import { formatCurrencyPrecise, formatDateShort } from "@/lib/utils/format";
import { useFinanceStore } from "@/lib/store";

export function TransactionItem({ tx }: { tx: Transaction }) {
  const removeTransaction = useFinanceStore((s) => s.removeTransaction);
  const meta = CATEGORY_META[tx.category];
  const sign = tx.flow === "income" ? "+" : "−";

  return (
    <div className="flex items-center justify-between border-b border-line-light py-3.5 last:border-none dark:border-line-dark">
      <div className="flex items-center gap-3">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: meta.color }}
        />
        <div>
          <p className="text-sm font-medium">
            {tx.name}
            {tx.installment && (
              <span className="ml-1.5 text-xs text-muted-light dark:text-muted-dark">
                {tx.installment.installmentIndex}/{tx.installment.totalInstallments}
              </span>
            )}
          </p>
          <p className="text-xs text-muted-light dark:text-muted-dark">
            {meta.label} · {formatDateShort(tx.date)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`tabular text-sm font-semibold ${
            tx.flow === "income" ? "text-good" : "text-ink-light dark:text-ink-dark"
          }`}
        >
          {sign} {formatCurrencyPrecise(tx.amount)}
        </span>
        <button
          onClick={() => removeTransaction(tx.id)}
          className="rounded-full p-1.5 text-muted-light transition-colors hover:text-bad dark:text-muted-dark"
          aria-label="Supprimer"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

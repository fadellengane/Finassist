"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { TransactionItem } from "@/components/transactions/TransactionItem";
import { formatCurrency } from "@/lib/utils/format";
import type { Transaction, TransactionGroup } from "@/lib/types";

export function TransactionGroupSection({
  group,
  defaultOpen = true,
  onEdit,
}: {
  group: TransactionGroup;
  defaultOpen?: boolean;
  onEdit: (tx: Transaction) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const net = group.totalIncome - group.totalExpense;

  return (
    <Card padded={false} className="overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4"
      >
        <div className="flex items-center gap-2.5">
          <ChevronDown
            size={15}
            strokeWidth={1.75}
            className={`text-muted-light transition-transform dark:text-muted-dark ${open ? "" : "-rotate-90"}`}
          />
          <span className="text-sm font-normal">{group.label}</span>
          <span className="text-xs font-light text-muted-light dark:text-muted-dark">
            ({group.items.length})
          </span>
        </div>
        <span className={`tabular text-sm font-medium ${net >= 0 ? "text-good" : ""}`}>
          {net >= 0 ? "+" : ""}
          {formatCurrency(net)}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-2">
              <AnimatePresence initial={false}>
                {group.items.map((tx) => (
                  <TransactionItem key={tx.id} tx={tx} onEdit={onEdit} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

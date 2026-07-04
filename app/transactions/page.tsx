"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useFinanceStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Sheet } from "@/components/ui/Sheet";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TransactionItem } from "@/components/transactions/TransactionItem";

export default function TransactionsPage() {
  const transactions = useFinanceStore((s) => s.transactions);
  const [open, setOpen] = useState(false);

  const sorted = [...transactions].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="space-y-4 px-5 pt-6">
      <div className="mb-1 flex items-center justify-between px-1">
        <h1 className="text-2xl font-extrabold tracking-tight">Transactions</h1>
        <button
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white shadow-soft"
          aria-label="Ajouter une transaction"
        >
          <Plus size={20} />
        </button>
      </div>

      {sorted.length === 0 ? (
        <Card className="text-center text-sm text-muted-light dark:text-muted-dark">
          Aucune transaction pour l&rsquo;instant. Ajoute ton premier mouvement.
        </Card>
      ) : (
        <Card padded={false} className="px-5">
          {sorted.map((tx) => (
            <TransactionItem key={tx.id} tx={tx} />
          ))}
        </Card>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title="Nouvelle transaction">
        <TransactionForm onDone={() => setOpen(false)} />
      </Sheet>
    </div>
  );
}

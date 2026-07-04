"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useFinanceStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Sheet } from "@/components/ui/Sheet";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TransactionItem } from "@/components/transactions/TransactionItem";
import type { Transaction } from "@/lib/types";

export default function TransactionsPage() {
  const transactions = useFinanceStore((s) => s.transactions);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const sorted = [...transactions].sort((a, b) => (a.date < b.date ? 1 : -1));

  function handleEdit(tx: Transaction) {
    setEditing(tx);
    setOpen(true);
  }

  function handleAddNew() {
    setEditing(null);
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    setEditing(null);
  }

  return (
    <div className="space-y-6 px-6 pt-8">
      <div className="mb-1 flex items-center justify-between px-1">
        <h1 className="text-2xl font-medium tracking-tight">Transactions</h1>
        <button
          onClick={handleAddNew}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white shadow-soft"
          aria-label="Ajouter une transaction"
        >
          <Plus size={20} strokeWidth={1.75} />
        </button>
      </div>

      {sorted.length === 0 ? (
        <Card className="text-center text-sm font-light text-muted-light dark:text-muted-dark">
          Aucune transaction pour l&rsquo;instant. Ajoute ton premier mouvement.
        </Card>
      ) : (
        <Card padded={false} className="px-6">
          {sorted.map((tx) => (
            <TransactionItem key={tx.id} tx={tx} onEdit={handleEdit} />
          ))}
        </Card>
      )}

      <Sheet
        open={open}
        onClose={handleClose}
        title={editing ? "Modifier la transaction" : "Nouvelle transaction"}
      >
        <TransactionForm onDone={handleClose} existing={editing ?? undefined} />
      </Sheet>
    </div>
  );
}

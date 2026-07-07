"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import { useFinanceStore } from "@/lib/store";
import { getAllBudgetStatuses } from "@/lib/finance/budgets";
import { Card } from "@/components/ui/Card";
import { Sheet } from "@/components/ui/Sheet";
import { Reveal } from "@/components/ui/Reveal";
import { BudgetCard } from "@/components/budgets/BudgetCard";
import { BudgetForm } from "@/components/budgets/BudgetForm";
import type { Category } from "@/lib/types";
import { CATEGORY_OPTIONS } from "@/lib/finance/categories";

export default function BudgetsPage() {
  const { budgets, transactions } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);

  const statuses = getAllBudgetStatuses(budgets, transactions);
  const canAddMore = budgets.length < CATEGORY_OPTIONS.length;

  function handleAddNew() {
    setEditingCategory(undefined);
    setOpen(true);
  }

  function handleEdit(category: Category) {
    setEditingCategory(category);
    setOpen(true);
  }

  return (
    <div className="space-y-6 px-6 pt-8">
      <div className="mb-1 flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <Link href="/" className="rounded-full p-1.5 text-muted-light dark:text-muted-dark" aria-label="Retour">
            <ChevronLeft size={22} strokeWidth={1.5} />
          </Link>
          <h1 className="text-2xl font-medium tracking-tight">Budgets</h1>
        </div>
        {canAddMore && (
          <button
            onClick={handleAddNew}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white shadow-soft"
            aria-label="Créer un budget"
          >
            <Plus size={20} strokeWidth={1.75} />
          </button>
        )}
      </div>

      <p className="px-1 text-sm font-light text-muted-light dark:text-muted-dark">
        Un plafond mensuel par catégorie, recalculé automatiquement.
      </p>

      {statuses.length === 0 ? (
        <Card className="text-center text-sm font-light text-muted-light dark:text-muted-dark">
          Aucun budget défini. Crée-en un pour suivre une catégorie de près.
        </Card>
      ) : (
        <div className="space-y-4">
          {statuses.map((status, i) => (
            <Reveal key={status.budget.id} index={i}>
              <BudgetCard status={status} onEdit={() => handleEdit(status.budget.category)} />
            </Reveal>
          ))}
        </div>
      )}

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={editingCategory ? "Modifier le budget" : "Nouveau budget"}
      >
        <BudgetForm existingCategory={editingCategory} onDone={() => setOpen(false)} />
      </Sheet>
    </div>
  );
}

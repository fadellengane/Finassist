"use client";

import { useMemo, useState } from "react";
import { Plus, SlidersHorizontal } from "lucide-react";
import { useFinanceStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Sheet } from "@/components/ui/Sheet";
import { Reveal } from "@/components/ui/Reveal";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { CategoryBreakdownChart } from "@/components/charts/CategoryBreakdownChart";
import { SearchBar } from "@/components/transactions/SearchBar";
import { CategoryQuickFilters } from "@/components/transactions/CategoryQuickFilters";
import { FilterSheet } from "@/components/transactions/FilterSheet";
import { GroupModeToggle } from "@/components/transactions/GroupModeToggle";
import { TransactionGroupSection } from "@/components/transactions/TransactionGroupSection";
import { EMPTY_FILTERS, countActiveFilters, filterTransactions } from "@/lib/finance/transactionFilters";
import { groupTransactions } from "@/lib/finance/transactionGrouping";
import type { Category, Transaction, TransactionGroupMode } from "@/lib/types";

export default function TransactionsPage() {
  const transactions = useFinanceStore((s) => s.transactions);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [groupMode, setGroupMode] = useState<TransactionGroupMode>("month");

  const sorted = useMemo(
    () => [...transactions].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [transactions]
  );

  const filtered = useMemo(() => filterTransactions(sorted, filters), [sorted, filters]);
  const groups = useMemo(() => groupTransactions(filtered, groupMode), [filtered, groupMode]);
  const activeFilterCount = countActiveFilters(filters);

  function toggleCategory(category: Category) {
    const categories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    setFilters({ ...filters, categories });
  }

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

      <Reveal>
        <CategoryBreakdownChart transactions={transactions} />
      </Reveal>

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SearchBar value={filters.keyword} onChange={(keyword) => setFilters({ ...filters, keyword })} />
        </div>
        <button
          onClick={() => setFilterSheetOpen(true)}
          className="relative flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-2xl border border-line-light text-muted-light dark:border-line-dark dark:text-muted-dark"
          aria-label="Filtres avancés"
        >
          <SlidersHorizontal size={17} strokeWidth={1.75} />
          {activeFilterCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <CategoryQuickFilters selected={filters.categories} onToggle={toggleCategory} />

      <GroupModeToggle mode={groupMode} onChange={setGroupMode} />

      {groups.length === 0 ? (
        <Card className="text-center text-sm font-light text-muted-light dark:text-muted-dark">
          Aucune transaction ne correspond à ta recherche.
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map((group, i) => (
            <TransactionGroupSection
              key={group.key}
              group={group}
              defaultOpen={i < 2}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      <Sheet
        open={open}
        onClose={handleClose}
        title={editing ? "Modifier la transaction" : "Nouvelle transaction"}
      >
        <TransactionForm onDone={handleClose} existing={editing ?? undefined} />
      </Sheet>

      <FilterSheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        filters={filters}
        onChange={setFilters}
      />
    </div>
  );
}

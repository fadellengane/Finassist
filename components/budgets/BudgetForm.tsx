"use client";

import { useState } from "react";
import { useFinanceStore } from "@/lib/store";
import { Field, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { CATEGORY_META, CATEGORY_OPTIONS } from "@/lib/finance/categories";
import type { Category } from "@/lib/types";

export function BudgetForm({
  existingCategory,
  onDone,
}: {
  existingCategory?: Category;
  onDone: () => void;
}) {
  const { budgets, setBudget } = useFinanceStore();
  const existing = budgets.find((b) => b.category === existingCategory);

  const takenCategories = new Set(budgets.map((b) => b.category));
  const availableCategories = CATEGORY_OPTIONS.filter(
    (c) => c === existingCategory || !takenCategories.has(c)
  );

  const [category, setCategory] = useState<Category>(existingCategory ?? availableCategories[0] ?? "autre");
  const [amount, setAmount] = useState(existing ? String(existing.monthlyLimit) : "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(amount.replace(",", "."));
    if (!value || value <= 0) return;
    setBudget(category, value);
    onDone();
  }

  return (
    <form onSubmit={handleSubmit}>
      <Field label="Catégorie">
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          disabled={Boolean(existingCategory)}
        >
          {availableCategories.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_META[c].label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Budget mensuel (€)">
        <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} required autoFocus />
      </Field>
      <Button type="submit" fullWidth className="mt-2">
        {existing ? "Mettre à jour" : "Créer le budget"}
      </Button>
    </form>
  );
}

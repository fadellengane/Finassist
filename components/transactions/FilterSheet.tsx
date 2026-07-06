"use client";

import { Sheet } from "@/components/ui/Sheet";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { QUICK_ADD_TYPES, TRANSACTION_TYPE_META } from "@/lib/finance/categories";
import { EMPTY_FILTERS } from "@/lib/finance/transactionFilters";
import type { TransactionFilters, TransactionType } from "@/lib/types";

export function FilterSheet({
  open,
  onClose,
  filters,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
}) {
  function toggleType(type: TransactionType) {
    const types = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    onChange({ ...filters, types });
  }

  function reset() {
    onChange({ ...EMPTY_FILTERS, keyword: filters.keyword, categories: filters.categories });
  }

  return (
    <Sheet open={open} onClose={onClose} title="Filtres">
      <Field label="Type de transaction">
        <div className="flex flex-wrap gap-2">
          {QUICK_ADD_TYPES.map((type) => {
            const active = filters.types.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={`rounded-pill border px-3.5 py-2 text-xs font-normal transition-colors ${
                  active
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line-light text-muted-light dark:border-line-dark dark:text-muted-dark"
                }`}
              >
                {TRANSACTION_TYPE_META[type].label}
              </button>
            );
          })}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Montant min (€)">
          <Input
            type="number"
            value={filters.minAmount ?? ""}
            onChange={(e) =>
              onChange({ ...filters, minAmount: e.target.value ? parseFloat(e.target.value) : null })
            }
          />
        </Field>
        <Field label="Montant max (€)">
          <Input
            type="number"
            value={filters.maxAmount ?? ""}
            onChange={(e) =>
              onChange({ ...filters, maxAmount: e.target.value ? parseFloat(e.target.value) : null })
            }
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Du">
          <Input
            type="date"
            value={filters.dateFrom ?? ""}
            onChange={(e) => onChange({ ...filters, dateFrom: e.target.value || null })}
          />
        </Field>
        <Field label="Au">
          <Input
            type="date"
            value={filters.dateTo ?? ""}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value || null })}
          />
        </Field>
      </div>

      <div className="mt-2 flex gap-3">
        <Button variant="secondary" fullWidth onClick={reset}>
          Réinitialiser
        </Button>
        <Button fullWidth onClick={onClose}>
          Appliquer
        </Button>
      </div>
    </Sheet>
  );
}

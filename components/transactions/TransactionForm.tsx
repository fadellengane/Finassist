"use client";

import { useState } from "react";
import { useFinanceStore } from "@/lib/store";
import { Field, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import {
  CATEGORY_META,
  CATEGORY_OPTIONS,
  QUICK_ADD_TYPES,
  RECURRENCE_LABELS,
  TRANSACTION_TYPE_META,
} from "@/lib/finance/categories";
import type { Category, Recurrence, TransactionType } from "@/lib/types";
import { todayISO } from "@/lib/utils/format";

export function TransactionForm({ onDone }: { onDone: () => void }) {
  const addTransaction = useFinanceStore((s) => s.addTransaction);
  const addInstallmentPurchase = useFinanceStore((s) => s.addInstallmentPurchase);

  const [type, setType] = useState<TransactionType>("depense");
  const meta = TRANSACTION_TYPE_META[type];

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [category, setCategory] = useState<Category>(meta.defaultCategory);
  const [recurrence, setRecurrence] = useState<Recurrence>(meta.defaultRecurrence);
  const [note, setNote] = useState("");

  const [paymentMode, setPaymentMode] = useState<"comptant" | "plusieurs_fois">("comptant");
  const [installmentsCount, setInstallmentsCount] = useState("3");

  function handleTypeChange(next: TransactionType) {
    setType(next);
    const nextMeta = TRANSACTION_TYPE_META[next];
    setCategory(nextMeta.defaultCategory);
    setRecurrence(nextMeta.defaultRecurrence);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(amount.replace(",", "."));
    if (!name.trim() || !value || value <= 0) return;

    if (type === "achat_ponctuel" && paymentMode === "plusieurs_fois") {
      addInstallmentPurchase({
        name: name.trim(),
        price: value,
        installmentsCount: Math.max(2, parseInt(installmentsCount, 10) || 2),
        startDate: date,
      });
    } else {
      addTransaction({
        name: name.trim(),
        type,
        category,
        amount: value,
        date,
        recurrence,
        note: note.trim() || undefined,
      });
    }
    onDone();
  }

  return (
    <form onSubmit={handleSubmit}>
      <Field label="Type">
        <Select value={type} onChange={(e) => handleTypeChange(e.target.value as TransactionType)}>
          {QUICK_ADD_TYPES.map((t) => (
            <option key={t} value={t}>
              {TRANSACTION_TYPE_META[t].label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Nom">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex. Courses, Loyer, Salaire…"
          required
        />
      </Field>

      <Field label="Montant (€)">
        <Input
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          required
        />
      </Field>

      {type === "achat_ponctuel" && (
        <Field label="Paiement">
          <div className="flex gap-2">
            {(["comptant", "plusieurs_fois"] as const).map((mode) => (
              <button
                type="button"
                key={mode}
                onClick={() => setPaymentMode(mode)}
                className={`flex-1 rounded-2xl border px-3 py-3 text-sm font-medium transition-colors ${
                  paymentMode === mode
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line-light bg-surface2-light text-muted-light dark:border-line-dark dark:bg-surface2-dark dark:text-muted-dark"
                }`}
              >
                {mode === "comptant" ? "Comptant" : "Plusieurs fois"}
              </button>
            ))}
          </div>
        </Field>
      )}

      {type === "achat_ponctuel" && paymentMode === "plusieurs_fois" ? (
        <Field label="Nombre d'échéances">
          <Input
            type="number"
            min={2}
            max={36}
            value={installmentsCount}
            onChange={(e) => setInstallmentsCount(e.target.value)}
          />
        </Field>
      ) : null}

      <Field label={paymentMode === "plusieurs_fois" ? "Date de première échéance" : "Date"}>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </Field>

      {!(type === "achat_ponctuel" && paymentMode === "plusieurs_fois") && (
        <Field label="Récurrence">
          <Select value={recurrence} onChange={(e) => setRecurrence(e.target.value as Recurrence)}>
            {Object.entries(RECURRENCE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <Field label="Catégorie">
        <Select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_META[c].label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Commentaire (facultatif)">
        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optionnel" />
      </Field>

      <Button type="submit" fullWidth className="mt-2">
        Ajouter
      </Button>
    </form>
  );
}

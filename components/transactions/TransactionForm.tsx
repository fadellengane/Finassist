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
import type { Category, Recurrence, Transaction, TransactionType } from "@/lib/types";
import { todayISO } from "@/lib/utils/format";

export function TransactionForm({
  onDone,
  existing,
}: {
  onDone: () => void;
  /** Si fourni, le formulaire passe en mode édition pour cette transaction. */
  existing?: Transaction;
}) {
  const addTransaction = useFinanceStore((s) => s.addTransaction);
  const updateTransaction = useFinanceStore((s) => s.updateTransaction);
  const addInstallmentPurchase = useFinanceStore((s) => s.addInstallmentPurchase);

  const isEditing = Boolean(existing);
  const defaultMeta = TRANSACTION_TYPE_META[existing?.type ?? "depense"];

  const [type, setType] = useState<TransactionType>(existing?.type ?? "depense");
  const meta = TRANSACTION_TYPE_META[type];

  const [name, setName] = useState(existing?.name ?? "");
  const [amount, setAmount] = useState(existing ? String(existing.amount) : "");
  const [date, setDate] = useState(existing?.date ?? todayISO());
  const [category, setCategory] = useState<Category>(existing?.category ?? defaultMeta.defaultCategory);
  const [recurrence, setRecurrence] = useState<Recurrence>(existing?.recurrence ?? defaultMeta.defaultRecurrence);
  const [note, setNote] = useState(existing?.note ?? "");

  const [paymentMode, setPaymentMode] = useState<"comptant" | "plusieurs_fois">("comptant");
  const [installmentsCount, setInstallmentsCount] = useState("3");

  // En édition, on ne propose jamais de régénérer un échéancier : on modifie
  // uniquement l'écriture sélectionnée (le champ `installment` d'origine est conservé).
  const showInstallmentOptions = !isEditing && type === "achat_ponctuel";

  function handleTypeChange(next: TransactionType) {
    setType(next);
    if (!isEditing) {
      const nextMeta = TRANSACTION_TYPE_META[next];
      setCategory(nextMeta.defaultCategory);
      setRecurrence(nextMeta.defaultRecurrence);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(amount.replace(",", "."));
    if (!name.trim() || !value || value <= 0) return;

    if (isEditing && existing) {
      updateTransaction(existing.id, {
        name: name.trim(),
        type,
        category,
        amount: value,
        date,
        recurrence,
        note: note.trim() || undefined,
      });
    } else if (showInstallmentOptions && paymentMode === "plusieurs_fois") {
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
      {isEditing && existing?.installment && (
        <p className="mb-4 rounded-2xl bg-surface2-light px-4 py-3 text-xs text-muted-light dark:bg-surface2-dark dark:text-muted-dark">
          Échéance {existing.installment.installmentIndex}/{existing.installment.totalInstallments}
          — seule cette écriture sera modifiée, le reste de l&rsquo;échéancier n&rsquo;est pas affecté.
        </p>
      )}

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

      {showInstallmentOptions && (
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

      {showInstallmentOptions && paymentMode === "plusieurs_fois" ? (
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

      <Field label={showInstallmentOptions && paymentMode === "plusieurs_fois" ? "Date de première échéance" : "Date"}>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </Field>

      {!(showInstallmentOptions && paymentMode === "plusieurs_fois") && (
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
        {isEditing ? "Enregistrer les modifications" : "Ajouter"}
      </Button>
    </form>
  );
}

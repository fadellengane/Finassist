"use client";

import { useState } from "react";
import { useFinanceStore } from "@/lib/store";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { addMonths } from "@/lib/utils/format";

export function GoalForm({ onDone }: { onDone: () => void }) {
  const addGoal = useFinanceStore((s) => s.addGoal);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(addMonths(new Date(), 6).toISOString().slice(0, 10));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(amount.replace(",", "."));
    if (!name.trim() || !value || value <= 0) return;
    addGoal({ name: name.trim(), targetAmount: value, targetDate: date });
    onDone();
  }

  return (
    <form onSubmit={handleSubmit}>
      <Field label="Nom de l'objectif">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex. Permis, Voyage, iPhone…"
          required
        />
      </Field>
      <Field label="Montant visé (€)">
        <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      </Field>
      <Field label="Date souhaitée">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </Field>
      <Button type="submit" fullWidth className="mt-2">
        Créer l&rsquo;objectif
      </Button>
    </form>
  );
}

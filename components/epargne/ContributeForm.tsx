"use client";

import { useState } from "react";
import { useFinanceStore } from "@/lib/store";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { todayISO } from "@/lib/utils/format";

export function ContributeForm({ goalId, onDone }: { goalId: string; onDone: () => void }) {
  const contributeToGoal = useFinanceStore((s) => s.contributeToGoal);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(amount.replace(",", "."));
    if (!value || value <= 0) return;
    contributeToGoal(goalId, value, date);
    onDone();
  }

  return (
    <form onSubmit={handleSubmit}>
      <Field label="Montant du versement (€)">
        <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} required autoFocus />
      </Field>
      <Field label="Date">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </Field>
      <Button type="submit" fullWidth className="mt-2">
        Verser
      </Button>
    </form>
  );
}

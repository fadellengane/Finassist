"use client";

import { Field, Input } from "@/components/ui/Field";

export interface SimulatorFormValues {
  name: string;
  price: string;
  installmentsCount: string;
  startDate: string;
  comptant: boolean;
}

export function SimulatorForm({
  values,
  onChange,
}: {
  values: SimulatorFormValues;
  onChange: (values: SimulatorFormValues) => void;
}) {
  return (
    <div>
      <Field label="Nom de l'achat">
        <Input
          value={values.name}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
          placeholder="Ex. Nouveau téléphone"
        />
      </Field>

      <Field label="Prix (€)">
        <Input
          inputMode="decimal"
          value={values.price}
          onChange={(e) => onChange({ ...values, price: e.target.value })}
          placeholder="0"
        />
      </Field>

      <Field label="Paiement">
        <div className="flex gap-2">
          {[true, false].map((comptant) => (
            <button
              type="button"
              key={String(comptant)}
              onClick={() => onChange({ ...values, comptant })}
              className={`flex-1 rounded-2xl border px-3 py-3 text-sm font-medium transition-colors ${
                values.comptant === comptant
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line-light bg-surface2-light text-muted-light dark:border-line-dark dark:bg-surface2-dark dark:text-muted-dark"
              }`}
            >
              {comptant ? "Comptant" : "Plusieurs fois"}
            </button>
          ))}
        </div>
      </Field>

      {!values.comptant && (
        <Field label="Nombre de mensualités">
          <Input
            type="number"
            min={2}
            max={36}
            value={values.installmentsCount}
            onChange={(e) => onChange({ ...values, installmentsCount: e.target.value })}
          />
        </Field>
      )}

      <Field label="Date de début">
        <Input
          type="date"
          value={values.startDate}
          onChange={(e) => onChange({ ...values, startDate: e.target.value })}
        />
      </Field>
    </div>
  );
}

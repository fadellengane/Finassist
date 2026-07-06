"use client";

import { Field, Input, Select } from "@/components/ui/Field";
import { getActiveInstallmentGroups } from "@/lib/finance/scenarios";
import type { ScenarioType, Transaction } from "@/lib/types";

export interface ScenarioFormValues {
  name: string;
  price: string;
  installmentsCount: string;
  comptant: boolean;
  monthlyDelta: string;
  monthlyAmount: string;
  startDate: string;
  targetTransactionId: string;
}

export function ScenarioFields({
  type,
  values,
  onChange,
  transactions,
}: {
  type: ScenarioType;
  values: ScenarioFormValues;
  onChange: (values: ScenarioFormValues) => void;
  transactions: Transaction[];
}) {
  const set = (patch: Partial<ScenarioFormValues>) => onChange({ ...values, ...patch });

  if (type === "achat") {
    return (
      <div>
        <Field label="Nom de l'achat">
          <Input value={values.name} onChange={(e) => set({ name: e.target.value })} placeholder="Ex. Nouveau téléphone" />
        </Field>
        <Field label="Prix (€)">
          <Input inputMode="decimal" value={values.price} onChange={(e) => set({ price: e.target.value })} placeholder="0" />
        </Field>
        <Field label="Paiement">
          <div className="flex gap-2">
            {[true, false].map((comptant) => (
              <button
                type="button"
                key={String(comptant)}
                onClick={() => set({ comptant })}
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
              onChange={(e) => set({ installmentsCount: e.target.value })}
            />
          </Field>
        )}
        <Field label="Date de début">
          <Input type="date" value={values.startDate} onChange={(e) => set({ startDate: e.target.value })} />
        </Field>
      </div>
    );
  }

  if (type === "salaire") {
    return (
      <div>
        <Field label="Variation mensuelle (€)">
          <Input
            inputMode="decimal"
            value={values.monthlyDelta}
            onChange={(e) => set({ monthlyDelta: e.target.value })}
            placeholder="Ex. 200 (hausse) ou -150 (baisse)"
          />
        </Field>
        <Field label="À partir du">
          <Input type="date" value={values.startDate} onChange={(e) => set({ startDate: e.target.value })} />
        </Field>
        <p className="mb-2 text-xs font-light text-muted-light dark:text-muted-dark">
          Une valeur négative simule une baisse de revenu.
        </p>
      </div>
    );
  }

  if (type === "abonnement_ajout" || type === "depense_recurrente") {
    return (
      <div>
        <Field label="Nom">
          <Input
            value={values.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder={type === "abonnement_ajout" ? "Ex. Spotify" : "Ex. Crédit voiture"}
          />
        </Field>
        <Field label="Montant mensuel (€)">
          <Input
            inputMode="decimal"
            value={values.monthlyAmount}
            onChange={(e) => set({ monthlyAmount: e.target.value })}
            placeholder="0"
          />
        </Field>
        <Field label="À partir du">
          <Input type="date" value={values.startDate} onChange={(e) => set({ startDate: e.target.value })} />
        </Field>
      </div>
    );
  }

  if (type === "abonnement_suppression") {
    const abonnements = transactions.filter((t) => t.type === "abonnement");
    return (
      <Field label="Abonnement à résilier">
        <Select
          value={values.targetTransactionId}
          onChange={(e) => set({ targetTransactionId: e.target.value })}
        >
          <option value="">Sélectionner…</option>
          {abonnements.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} — {a.amount} €/mois
            </option>
          ))}
        </Select>
        {abonnements.length === 0 && (
          <p className="mt-2 text-xs font-light text-muted-light dark:text-muted-dark">
            Aucun abonnement enregistré pour l&rsquo;instant.
          </p>
        )}
      </Field>
    );
  }

  if (type === "remboursement_anticipe") {
    const groups = getActiveInstallmentGroups(transactions);
    return (
      <Field label="Achat à solder">
        <Select
          value={values.targetTransactionId}
          onChange={(e) => set({ targetTransactionId: e.target.value })}
        >
          <option value="">Sélectionner…</option>
          {groups.map((g) => (
            <option key={g.groupId} value={g.representativeTransactionId}>
              {g.name} — {g.remainingCount} échéance(s) restante(s), {Math.round(g.remainingAmount)} €
            </option>
          ))}
        </Select>
        {groups.length === 0 && (
          <p className="mt-2 text-xs font-light text-muted-light dark:text-muted-dark">
            Aucun achat en plusieurs fois en cours.
          </p>
        )}
      </Field>
    );
  }

  return null;
}

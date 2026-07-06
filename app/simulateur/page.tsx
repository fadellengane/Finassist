"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useFinanceStore } from "@/lib/store";
import { simulateScenario } from "@/lib/finance/scenarios";
import { ScenarioTypePicker } from "@/components/simulateur/ScenarioTypePicker";
import { ScenarioFields, type ScenarioFormValues } from "@/components/simulateur/ScenarioFields";
import { ScenarioComparisonChart } from "@/components/simulateur/ScenarioComparisonChart";
import { ScenarioResultCard } from "@/components/simulateur/ScenarioResultCard";
import { Reveal } from "@/components/ui/Reveal";
import type { ScenarioInput } from "@/lib/finance/scenarios";
import type { ScenarioType } from "@/lib/types";
import { todayISO } from "@/lib/utils/format";

const DEFAULT_VALUES: ScenarioFormValues = {
  name: "",
  price: "",
  installmentsCount: "3",
  comptant: true,
  monthlyDelta: "",
  monthlyAmount: "",
  startDate: todayISO(),
  targetTransactionId: "",
};

function buildScenarioInput(type: ScenarioType, v: ScenarioFormValues): ScenarioInput | null {
  const num = (s: string) => parseFloat(s.replace(",", "."));

  switch (type) {
    case "achat": {
      const price = num(v.price);
      if (!price || price <= 0) return null;
      return {
        type,
        name: v.name || "Achat simulé",
        price,
        installmentsCount: v.comptant ? 1 : Math.max(2, parseInt(v.installmentsCount, 10) || 2),
        startDate: v.startDate,
      };
    }
    case "salaire": {
      const delta = num(v.monthlyDelta);
      if (!delta) return null;
      return { type, monthlyDelta: delta, startDate: v.startDate, name: v.name || undefined };
    }
    case "abonnement_ajout":
    case "depense_recurrente": {
      const amount = num(v.monthlyAmount);
      if (!amount || amount <= 0) return null;
      return { type, name: v.name || undefined, monthlyAmount: amount, startDate: v.startDate };
    }
    case "abonnement_suppression":
    case "remboursement_anticipe": {
      if (!v.targetTransactionId) return null;
      return { type, targetTransactionId: v.targetTransactionId };
    }
    default:
      return null;
  }
}

export default function SimulateurPage() {
  const { transactions, startingBalance, startingBalanceDate } = useFinanceStore();
  const [scenarioType, setScenarioType] = useState<ScenarioType>("achat");
  const [values, setValues] = useState<ScenarioFormValues>(DEFAULT_VALUES);

  function handleTypeChange(type: ScenarioType) {
    setScenarioType(type);
    setValues(DEFAULT_VALUES);
  }

  const scenarioInput = useMemo(
    () => buildScenarioInput(scenarioType, values),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scenarioType, values]
  );

  const result = useMemo(() => {
    if (!scenarioInput) return null;
    return simulateScenario(scenarioInput, transactions, startingBalance, startingBalanceDate, 6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioInput, transactions, startingBalance, startingBalanceDate]);

  return (
    <div className="space-y-6 px-6 pt-8">
      <div className="mb-1 flex items-center gap-3 px-1">
        <Link href="/" className="rounded-full p-1.5 text-muted-light dark:text-muted-dark" aria-label="Retour">
          <ChevronLeft size={22} strokeWidth={1.5} />
        </Link>
        <h1 className="text-2xl font-medium tracking-tight">Simuler un scénario</h1>
      </div>

      <ScenarioTypePicker value={scenarioType} onChange={handleTypeChange} />

      <ScenarioFields
        type={scenarioType}
        values={values}
        onChange={setValues}
        transactions={transactions}
      />

      {result ? (
        <>
          <Reveal>
            <ScenarioResultCard result={result} />
          </Reveal>
          <Reveal index={1}>
            <ScenarioComparisonChart baseline={result.baseline} scenario={result.scenario} />
          </Reveal>
        </>
      ) : (
        <p className="px-1 text-sm font-light text-muted-light dark:text-muted-dark">
          Complète les champs ci-dessus pour voir le résultat immédiatement.
        </p>
      )}
    </div>
  );
}

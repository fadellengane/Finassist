"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useFinanceStore } from "@/lib/store";
import { simulatePurchase } from "@/lib/finance/engine";
import { SimulatorForm, type SimulatorFormValues } from "@/components/simulateur/SimulatorForm";
import { SimulatorResult } from "@/components/simulateur/SimulatorResult";
import { todayISO } from "@/lib/utils/format";

export default function SimulateurPage() {
  const { transactions, startingBalance, startingBalanceDate } = useFinanceStore();

  const [values, setValues] = useState<SimulatorFormValues>({
    name: "",
    price: "",
    installmentsCount: "3",
    startDate: todayISO(),
    comptant: true,
  });

  const price = parseFloat(values.price.replace(",", "."));
  const validPrice = !isNaN(price) && price > 0;

  const result = useMemo(() => {
    if (!validPrice) return null;
    return simulatePurchase(
      {
        name: values.name || "Achat simulé",
        price,
        installmentsCount: values.comptant ? 1 : Math.max(2, parseInt(values.installmentsCount, 10) || 2),
        startDate: values.startDate,
      },
      transactions,
      startingBalance,
      startingBalanceDate
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, validPrice, price, transactions, startingBalance, startingBalanceDate]);

  return (
    <div className="space-y-4 px-5 pt-6">
      <div className="mb-1 flex items-center gap-3 px-1">
        <Link href="/" className="rounded-full p-1.5 text-muted-light dark:text-muted-dark" aria-label="Retour">
          <ChevronLeft size={22} />
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight">Simuler un achat</h1>
      </div>

      <SimulatorForm values={values} onChange={setValues} />

      {result ? (
        <SimulatorResult result={result} />
      ) : (
        <p className="px-1 text-sm text-muted-light dark:text-muted-dark">
          Renseigne un prix pour voir le résultat immédiatement.
        </p>
      )}
    </div>
  );
}

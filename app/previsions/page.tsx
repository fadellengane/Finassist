"use client";

import { useFinanceStore } from "@/lib/store";
import { getForecast } from "@/lib/finance/engine";
import { ForecastTimeline } from "@/components/previsions/ForecastTimeline";

export default function PrevisionsPage() {
  const { transactions, startingBalance, startingBalanceDate } = useFinanceStore();
  const forecast = getForecast(transactions, startingBalance, startingBalanceDate, 3);

  return (
    <div className="space-y-4 px-5 pt-6">
      <div className="mb-1 px-1">
        <h1 className="text-2xl font-extrabold tracking-tight">Prévisions</h1>
        <p className="mt-1 text-sm text-muted-light dark:text-muted-dark">
          Les 3 prochains mois, recalculés automatiquement.
        </p>
      </div>

      <ForecastTimeline months={forecast} />
    </div>
  );
}

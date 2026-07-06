"use client";

import { useState } from "react";
import { useFinanceStore } from "@/lib/store";
import { getForecast } from "@/lib/finance/engine";
import { ForecastTimeline } from "@/components/previsions/ForecastTimeline";
import { DurationPicker } from "@/components/previsions/DurationPicker";
import { MonthDetailSheet } from "@/components/previsions/MonthDetailSheet";
import { IncomeExpenseChart } from "@/components/charts/IncomeExpenseChart";
import { Reveal } from "@/components/ui/Reveal";
import type { MonthForecast } from "@/lib/types";

export default function PrevisionsPage() {
  const { transactions, startingBalance, startingBalanceDate } = useFinanceStore();
  const [months, setMonths] = useState(3);
  const [selectedMonth, setSelectedMonth] = useState<MonthForecast | null>(null);

  const forecast = getForecast(transactions, startingBalance, startingBalanceDate, months);

  return (
    <div className="space-y-7 px-6 pt-8">
      <div className="px-1">
        <h1 className="text-2xl font-medium tracking-tight">Prévisions</h1>
        <p className="mt-1.5 text-sm font-light text-muted-light dark:text-muted-dark">
          Choisis une durée, puis touche un mois pour voir le détail.
        </p>
      </div>

      <Reveal>
        <IncomeExpenseChart forecast={forecast} />
      </Reveal>

      <DurationPicker months={months} onChange={setMonths} />

      <ForecastTimeline months={forecast} onSelectMonth={setSelectedMonth} />

      <MonthDetailSheet
        month={selectedMonth}
        transactions={transactions}
        onClose={() => setSelectedMonth(null)}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ChevronRight, Settings } from "lucide-react";
import { useFinanceStore } from "@/lib/store";
import { BalanceCard } from "@/components/home/BalanceCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SettingsSheet } from "@/components/home/SettingsSheet";
import {
  getCurrentBalance,
  getBalanceAfterCommitments,
  getForecast,
  getSafeToSpend,
  riskFromBalance,
} from "@/lib/finance/engine";

export default function HomePage() {
  const { transactions, startingBalance, startingBalanceDate } = useFinanceStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const available = getCurrentBalance(transactions, startingBalance, startingBalanceDate);
  const afterCommitments = getBalanceAfterCommitments(transactions, startingBalance, startingBalanceDate);
  const forecast = getForecast(transactions, startingBalance, startingBalanceDate, 3);
  const forecast3Months = forecast[forecast.length - 1]?.soldeFinal ?? available;
  const safeToSpend = getSafeToSpend(transactions, startingBalance, startingBalanceDate);

  const worstBalance = Math.min(available, ...forecast.map((m) => m.soldeFinal));
  const risk = riskFromBalance(worstBalance);

  return (
    <div className="space-y-4 px-5 pt-6">
      <div className="mb-1 flex items-center justify-between px-1">
        <h1 className="text-2xl font-extrabold tracking-tight">Accueil</h1>
        <button
          onClick={() => setSettingsOpen(true)}
          className="rounded-full p-2 text-muted-light dark:text-muted-dark"
          aria-label="Réglages"
        >
          <Settings size={20} />
        </button>
      </div>

      <BalanceCard
        available={available}
        afterCommitments={afterCommitments}
        forecast3Months={forecast3Months}
        safeToSpend={safeToSpend}
      />

      <StatusBadge risk={risk} />

      <Link href="/simulateur">
        <Button fullWidth>Simuler un achat</Button>
      </Link>

      <Link href="/coach">
        <Card className="flex items-center justify-between !p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold">Coach financier</p>
              <p className="text-xs text-muted-light dark:text-muted-dark">
                Des conseils basés sur tes habitudes
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-muted-light dark:text-muted-dark" />
        </Card>
      </Link>

      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

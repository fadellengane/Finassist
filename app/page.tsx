"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ChevronRight, Settings, Bell } from "lucide-react";
import { useFinanceStore } from "@/lib/store";
import { BalanceCard } from "@/components/home/BalanceCard";
import { RemainingToLiveCard } from "@/components/home/RemainingToLiveCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { SettingsSheet } from "@/components/home/SettingsSheet";
import { ReminderSheet } from "@/components/reminders/ReminderSheet";
import { BalanceEvolutionChart } from "@/components/charts/BalanceEvolutionChart";
import {
  getCurrentBalance,
  getBalanceAfterCommitments,
  getForecast,
  getRemainingToLive,
  getSafeToSpend,
  riskFromBalance,
} from "@/lib/finance/engine";
import { generateReminders } from "@/lib/finance/reminders";

export default function HomePage() {
  const { transactions, goals, startingBalance, startingBalanceDate } = useFinanceStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);

  const available = getCurrentBalance(transactions, startingBalance, startingBalanceDate);
  const afterCommitments = getBalanceAfterCommitments(transactions, startingBalance, startingBalanceDate);
  const forecast = getForecast(transactions, startingBalance, startingBalanceDate, 6);
  const forecast3Months = forecast[2]?.soldeFinal ?? available;
  const safeToSpend = getSafeToSpend(transactions, startingBalance, startingBalanceDate);
  const remaining = getRemainingToLive(transactions, startingBalance, startingBalanceDate);

  const worstBalance = Math.min(available, ...forecast.map((m) => m.soldeFinal));
  const risk = riskFromBalance(worstBalance);

  const reminders = generateReminders(transactions, goals, startingBalance, startingBalanceDate);

  return (
    <div className="space-y-6 px-6 pt-8">
      <div className="mb-1 flex items-center justify-between px-1">
        <h1 className="text-2xl font-medium tracking-tight">Accueil</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setRemindersOpen(true)}
            className="relative rounded-full p-2 text-muted-light dark:text-muted-dark"
            aria-label="Rappels"
          >
            <Bell size={20} strokeWidth={1.75} />
            {reminders.length > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-bad" />
            )}
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="rounded-full p-2 text-muted-light dark:text-muted-dark"
            aria-label="Réglages"
          >
            <Settings size={20} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <Reveal index={0}>
        <BalanceCard
          available={available}
          afterCommitments={afterCommitments}
          forecast3Months={forecast3Months}
          safeToSpend={safeToSpend}
        />
      </Reveal>

      <Reveal index={1}>
        <StatusBadge risk={risk} />
      </Reveal>

      <Reveal index={2}>
        <RemainingToLiveCard data={remaining} />
      </Reveal>

      <Reveal index={3}>
        <BalanceEvolutionChart forecast={forecast} />
      </Reveal>

      <Reveal index={4}>
        <Link href="/simulateur">
          <Button fullWidth>Simuler un scénario</Button>
        </Link>
      </Reveal>

      <Reveal index={5}>
        <Link href="/coach">
          <Card className="flex items-center justify-between !p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-sm font-normal">Coach financier</p>
                <p className="text-xs font-light text-muted-light dark:text-muted-dark">
                  Des conseils basés sur tes habitudes
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted-light dark:text-muted-dark" />
          </Card>
        </Link>
      </Reveal>

      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ReminderSheet open={remindersOpen} onClose={() => setRemindersOpen(false)} reminders={reminders} />
    </div>
  );
}

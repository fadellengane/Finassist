"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useFinanceStore } from "@/lib/store";
import { generateCoachTips } from "@/lib/finance/coach";
import { CoachTipCard } from "@/components/coach/CoachTipCard";

export default function CoachPage() {
  const transactions = useFinanceStore((s) => s.transactions);
  const tips = generateCoachTips(transactions);

  return (
    <div className="space-y-6 px-6 pt-8">
      <div className="mb-1 flex items-center gap-3 px-1">
        <Link href="/" className="rounded-full p-1.5 text-muted-light dark:text-muted-dark" aria-label="Retour">
          <ChevronLeft size={22} strokeWidth={1.5} />
        </Link>
        <h1 className="text-2xl font-medium tracking-tight">Coach financier</h1>
      </div>
      <p className="px-1 text-sm font-light text-muted-light dark:text-muted-dark">
        Basé sur tes 30 derniers jours de transactions.
      </p>

      <div className="space-y-4">
        {tips.map((tip) => (
          <CoachTipCard key={tip.id} tip={tip} />
        ))}
      </div>
    </div>
  );
}

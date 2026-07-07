"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useFinanceStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Sheet } from "@/components/ui/Sheet";
import { Reveal } from "@/components/ui/Reveal";
import { GoalCard } from "@/components/epargne/GoalCard";
import { GoalForm } from "@/components/epargne/GoalForm";
import { ContributeForm } from "@/components/epargne/ContributeForm";
import { SavingsProgressChart } from "@/components/charts/SavingsProgressChart";

export default function EpargnePage() {
  const { goals, transactions } = useFinanceStore();
  const [openCreate, setOpenCreate] = useState(false);
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);

  return (
    <div className="space-y-6 px-6 pt-8">
      <div className="mb-1 flex items-center justify-between px-1">
        <h1 className="text-2xl font-medium tracking-tight">Épargne</h1>
        <button
          onClick={() => setOpenCreate(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white shadow-soft"
          aria-label="Créer un objectif"
        >
          <Plus size={20} strokeWidth={1.75} />
        </button>
      </div>

      {goals.length > 0 && (
        <Reveal>
          <SavingsProgressChart goals={goals} transactions={transactions} />
        </Reveal>
      )}

      {goals.length === 0 ? (
        <Card className="text-center text-sm font-light text-muted-light dark:text-muted-dark">
          Aucun objectif pour l&rsquo;instant. Crée-en un pour commencer à épargner.
        </Card>
      ) : (
        <div className="space-y-5">
          {goals.map((goal, i) => (
            <Reveal key={goal.id} index={i}>
              <GoalCard goal={goal} transactions={transactions} onContribute={setContributeGoalId} />
            </Reveal>
          ))}
        </div>
      )}

      <Sheet open={openCreate} onClose={() => setOpenCreate(false)} title="Nouvel objectif">
        <GoalForm onDone={() => setOpenCreate(false)} />
      </Sheet>

      <Sheet
        open={contributeGoalId !== null}
        onClose={() => setContributeGoalId(null)}
        title="Ajouter un versement"
      >
        {contributeGoalId && (
          <ContributeForm goalId={contributeGoalId} onDone={() => setContributeGoalId(null)} />
        )}
      </Sheet>
    </div>
  );
}

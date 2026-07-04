"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useFinanceStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Sheet } from "@/components/ui/Sheet";
import { GoalCard } from "@/components/epargne/GoalCard";
import { GoalForm } from "@/components/epargne/GoalForm";
import { ContributeForm } from "@/components/epargne/ContributeForm";

export default function EpargnePage() {
  const { goals, transactions } = useFinanceStore();
  const [openCreate, setOpenCreate] = useState(false);
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);

  return (
    <div className="space-y-4 px-5 pt-6">
      <div className="mb-1 flex items-center justify-between px-1">
        <h1 className="text-2xl font-extrabold tracking-tight">Épargne</h1>
        <button
          onClick={() => setOpenCreate(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white shadow-soft"
          aria-label="Créer un objectif"
        >
          <Plus size={20} />
        </button>
      </div>

      {goals.length === 0 ? (
        <Card className="text-center text-sm text-muted-light dark:text-muted-dark">
          Aucun objectif pour l&rsquo;instant. Crée-en un pour commencer à épargner.
        </Card>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              transactions={transactions}
              onContribute={setContributeGoalId}
            />
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

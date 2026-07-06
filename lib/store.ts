"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Budget, Category, Recurrence, SavingsGoal, Transaction, TransactionType } from "@/lib/types";
import { TRANSACTION_TYPE_META } from "@/lib/finance/categories";
import { generateId } from "@/lib/utils/id";
import { buildInstallmentTransactions } from "@/lib/finance/engine";
import { todayISO, addMonths } from "@/lib/utils/format";

interface NewTransactionInput {
  name: string;
  type: TransactionType;
  category?: Category;
  amount: number;
  date: string;
  recurrence?: Recurrence;
  note?: string;
  goalId?: string;
}

interface NewInstallmentInput {
  name: string;
  price: number;
  installmentsCount: number;
  startDate: string;
}

interface FinanceState {
  hasHydrated: boolean;
  startingBalance: number;
  startingBalanceDate: string;
  transactions: Transaction[];
  goals: SavingsGoal[];
  budgets: Budget[];
  onboardingSeen: boolean;

  setHasHydrated: (v: boolean) => void;
  setStartingBalance: (amount: number, date: string) => void;
  addTransaction: (input: NewTransactionInput) => void;
  updateTransaction: (id: string, updates: NewTransactionInput) => void;
  addInstallmentPurchase: (input: NewInstallmentInput) => void;
  removeTransaction: (id: string) => void;
  addGoal: (goal: { name: string; targetAmount: number; targetDate: string }) => string;
  removeGoal: (id: string) => void;
  contributeToGoal: (goalId: string, amount: number, date: string) => void;
  setOnboardingSeen: (seen: boolean) => void;
  setBudget: (category: Category, monthlyLimit: number) => void;
  removeBudget: (id: string) => void;
}

function seedTransactions(): Transaction[] {
  const today = new Date();
  const thisMonth = (day: number) =>
    new Date(today.getFullYear(), today.getMonth(), day).toISOString().slice(0, 10);
  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };

  return [
    { id: generateId("tx"), name: "Salaire", type: "salaire", category: "revenu", flow: "income", amount: 2200, date: thisMonth(1), recurrence: "monthly" },
    { id: generateId("tx"), name: "Loyer", type: "facture", category: "logement", flow: "expense", amount: 750, date: thisMonth(3), recurrence: "monthly" },
    { id: generateId("tx"), name: "Forfait mobile", type: "abonnement", category: "abonnements", flow: "expense", amount: 19.99, date: thisMonth(5), recurrence: "monthly" },
    { id: generateId("tx"), name: "Netflix", type: "abonnement", category: "abonnements", flow: "expense", amount: 14.99, date: thisMonth(7), recurrence: "monthly" },
    { id: generateId("tx"), name: "Salle de sport", type: "abonnement", category: "abonnements", flow: "expense", amount: 29.9, date: thisMonth(10), recurrence: "monthly" },
    { id: generateId("tx"), name: "Restaurant", type: "depense", category: "restauration", flow: "expense", amount: 42, date: daysAgo(3), recurrence: "none" },
    { id: generateId("tx"), name: "Livraison repas", type: "depense", category: "restauration", flow: "expense", amount: 28, date: daysAgo(9), recurrence: "none" },
    { id: generateId("tx"), name: "Café & déjeuners", type: "depense", category: "restauration", flow: "expense", amount: 75, date: daysAgo(15), recurrence: "none" },
  ];
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      startingBalance: 900,
      startingBalanceDate: todayISO(),
      transactions: seedTransactions(),
      onboardingSeen: false,
      budgets: [
        { id: generateId("budget"), category: "restauration", monthlyLimit: 150 },
        { id: generateId("budget"), category: "abonnements", monthlyLimit: 70 },
      ],
      goals: [
        {
          id: generateId("goal"),
          name: "Voyage",
          targetAmount: 1800,
          targetDate: addMonths(new Date(), 8).toISOString().slice(0, 10),
          createdAt: addMonths(new Date(), -2).toISOString().slice(0, 10),
        },
      ],

      setHasHydrated: (v) => set({ hasHydrated: v }),

      setStartingBalance: (amount, date) =>
        set({ startingBalance: amount, startingBalanceDate: date }),

      addTransaction: (input) => {
        const meta = TRANSACTION_TYPE_META[input.type];
        const tx: Transaction = {
          id: generateId("tx"),
          name: input.name,
          type: input.type,
          category: input.category ?? meta.defaultCategory,
          flow: meta.flow,
          amount: Math.abs(input.amount),
          date: input.date,
          recurrence: input.recurrence ?? meta.defaultRecurrence,
          note: input.note,
          goalId: input.goalId,
        };
        set({ transactions: [tx, ...get().transactions] });
      },

      updateTransaction: (id, input) => {
        const meta = TRANSACTION_TYPE_META[input.type];
        set({
          transactions: get().transactions.map((t) =>
            t.id === id
              ? {
                  ...t,
                  name: input.name,
                  type: input.type,
                  category: input.category ?? meta.defaultCategory,
                  flow: meta.flow,
                  amount: Math.abs(input.amount),
                  date: input.date,
                  recurrence: input.recurrence ?? meta.defaultRecurrence,
                  note: input.note,
                }
              : t
          ),
        });
      },

      addInstallmentPurchase: (input) => {
        const generated = buildInstallmentTransactions(input);
        set({ transactions: [...generated, ...get().transactions] });
      },

      removeTransaction: (id) =>
        set({ transactions: get().transactions.filter((t) => t.id !== id) }),

      addGoal: (goal) => {
        const id = generateId("goal");
        const newGoal: SavingsGoal = {
          id,
          name: goal.name,
          targetAmount: goal.targetAmount,
          targetDate: goal.targetDate,
          createdAt: todayISO(),
        };
        set({ goals: [...get().goals, newGoal] });
        return id;
      },

      removeGoal: (id) =>
        set({
          goals: get().goals.filter((g) => g.id !== id),
          transactions: get().transactions.filter((t) => t.goalId !== id),
        }),

      contributeToGoal: (goalId, amount, date) => {
        const tx: Transaction = {
          id: generateId("tx"),
          name: "Versement épargne",
          type: "epargne",
          category: "epargne",
          flow: "expense",
          amount: Math.abs(amount),
          date,
          recurrence: "none",
          goalId,
        };
        set({ transactions: [tx, ...get().transactions] });
      },

      setOnboardingSeen: (seen) => set({ onboardingSeen: seen }),

      setBudget: (category, monthlyLimit) => {
        const existing = get().budgets.find((b) => b.category === category);
        if (existing) {
          set({
            budgets: get().budgets.map((b) =>
              b.id === existing.id ? { ...b, monthlyLimit } : b
            ),
          });
        } else {
          set({
            budgets: [...get().budgets, { id: generateId("budget"), category, monthlyLimit }],
          });
        }
      },

      removeBudget: (id) => set({ budgets: get().budgets.filter((b) => b.id !== id) }),
    }),
    {
      name: "finassist-storage",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);

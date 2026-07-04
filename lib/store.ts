"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type {
  Category,
  Recurrence,
  SavingsGoal,
  Transaction,
  TransactionType,
} from "@/lib/types";

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

  setHasHydrated: (v: boolean) => void;
  setStartingBalance: (amount: number, date: string) => void;

  addTransaction: (input: NewTransactionInput) => void;
  addInstallmentPurchase: (input: NewInstallmentInput) => void;

  removeTransaction: (id: string) => void;

  addGoal: (goal: {
    name: string;
    targetAmount: number;
    targetDate: string;
  }) => string;

  removeGoal: (id: string) => void;

  contributeToGoal: (goalId: string, amount: number, date: string) => void;

  // 🔥 AJOUT IMPORTANT
  getBalance: () => number;
}

function seedTransactions(): Transaction[] {
  const today = new Date();

  const thisMonth = (day: number) =>
    new Date(today.getFullYear(), today.getMonth(), day)
      .toISOString()
      .slice(0, 10);

  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };

  return [
    {
      id: generateId("tx"),
      name: "Salaire",
      type: "salaire",
      category: "revenu",
      flow: "income",
      amount: 2200,
      date: thisMonth(1),
      recurrence: "monthly",
    },
    {
      id: generateId("tx"),
      name: "Loyer",
      type: "facture",
      category: "logement",
      flow: "expense",
      amount: 750,
      date: thisMonth(3),
      recurrence: "monthly",
    },
    {
      id: generateId("tx"),
      name: "Netflix",
      type: "abonnement",
      category: "abonnements",
      flow: "expense",
      amount: 14.99,
      date: thisMonth(7),
      recurrence: "monthly",
    },
    {
      id: generateId("tx"),
      name: "Restaurant",
      type: "depense",
      category: "restauration",
      flow: "expense",
      amount: 42,
      date: daysAgo(3),
      recurrence: "none",
    },
  ];
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,

      startingBalance: 900,
      startingBalanceDate: todayISO(),

      transactions: seedTransactions(),

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

      // 🔥 AJOUT TRANSACTION (corrigé)
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

        set((state) => ({
          transactions: [tx, ...state.transactions],
        }));
      },

      addInstallmentPurchase: (input) => {
        const generated = buildInstallmentTransactions(input);

        set((state) => ({
          transactions: [...generated, ...state.transactions],
        }));
      },

      removeTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      addGoal: (goal) => {
        const id = generateId("goal");

        const newGoal: SavingsGoal = {
          id,
          name: goal.name,
          targetAmount: goal.targetAmount,
          targetDate: goal.targetDate,
          createdAt: todayISO(),
        };

        set((state) => ({
          goals: [...state.goals, newGoal],
        }));

        return id;
      },

      removeGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
          transactions: state.transactions.filter((t) => t.goalId !== id),
        })),

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

        set((state) => ({
          transactions: [tx, ...state.transactions],
        }));
      },

      // 🔥 CALCUL SOLDE (IMPORTANT)
      getBalance: () => {
        const { startingBalance, transactions } = get();

        return transactions.reduce((acc, tx) => {
          return tx.flow === "income"
            ? acc + tx.amount
            : acc - tx.amount;
        }, startingBalance);
      },
    }),
    {
      name: "finassist-storage",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
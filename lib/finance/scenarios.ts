import type { ScenarioResult, ScenarioType, Transaction } from "@/lib/types";
import { buildInstallmentTransactions, getForecast, riskFromBalance } from "@/lib/finance/engine";
import { generateId } from "@/lib/utils/id";
import { formatDateShort, todayISO } from "@/lib/utils/format";

/**
 * ============================================================================
 * SCÉNARIOS AVANCÉS
 * ----------------------------------------------------------------------------
 * Chaque scénario se traduit en une simple modification virtuelle de la
 * liste de transactions (des ajouts, et/ou des suppressions par id) — jamais
 * une mutation du store réel. On recalcule ensuite la prévision avec
 * `getForecast`, déjà générique, et on la compare à la prévision de base
 * pour isoler l'impact du scénario.
 * ============================================================================
 */

export interface ScenarioInput {
  type: ScenarioType;
  name?: string;

  // "achat"
  price?: number;
  installmentsCount?: number;
  startDate?: string;

  // "salaire" : delta mensuel, peut être négatif (baisse)
  monthlyDelta?: number;

  // "abonnement_ajout" / "depense_recurrente"
  monthlyAmount?: number;

  // "abonnement_suppression" : id de la transaction à annuler
  // "remboursement_anticipe" : id d'une échéance du groupe à solder
  targetTransactionId?: string;
}

export interface InstallmentGroupSummary {
  groupId: string;
  name: string;
  totalInstallments: number;
  remainingCount: number;
  remainingAmount: number;
  representativeTransactionId: string; // à passer comme `targetTransactionId`
}

/** Liste les achats en plusieurs fois qui ont encore des échéances à venir. */
export function getActiveInstallmentGroups(transactions: Transaction[]): InstallmentGroupSummary[] {
  const today = todayISO();
  const groups = new Map<string, InstallmentGroupSummary>();

  for (const tx of transactions) {
    if (!tx.installment) continue;
    const existing = groups.get(tx.installment.groupId);
    const isFuture = tx.date > today;

    if (!existing) {
      groups.set(tx.installment.groupId, {
        groupId: tx.installment.groupId,
        name: tx.name,
        totalInstallments: tx.installment.totalInstallments,
        remainingCount: isFuture ? 1 : 0,
        remainingAmount: isFuture ? tx.amount : 0,
        representativeTransactionId: tx.id,
      });
    } else if (isFuture) {
      existing.remainingCount += 1;
      existing.remainingAmount += tx.amount;
    }
  }

  return Array.from(groups.values()).filter((g) => g.remainingCount > 0);
}

function buildScenarioDiff(
  input: ScenarioInput,
  existingTransactions: Transaction[]
): { added: Transaction[]; removedIds: Set<string> } {
  const added: Transaction[] = [];
  const removedIds = new Set<string>();
  const startDate = input.startDate || todayISO();

  switch (input.type) {
    case "achat": {
      added.push(
        ...buildInstallmentTransactions({
          name: input.name || "Achat simulé",
          price: input.price || 0,
          installmentsCount: Math.max(1, input.installmentsCount || 1),
          startDate,
        })
      );
      break;
    }

    case "salaire": {
      const delta = input.monthlyDelta || 0;
      added.push({
        id: generateId("scenario"),
        name: input.name || (delta >= 0 ? "Augmentation de salaire" : "Baisse de salaire"),
        type: delta >= 0 ? "prime" : "depense_recurrente",
        category: delta >= 0 ? "revenu" : "autre",
        flow: delta >= 0 ? "income" : "expense",
        amount: Math.abs(delta),
        date: startDate,
        recurrence: "monthly",
      });
      break;
    }

    case "abonnement_ajout": {
      added.push({
        id: generateId("scenario"),
        name: input.name || "Nouvel abonnement",
        type: "abonnement",
        category: "abonnements",
        flow: "expense",
        amount: input.monthlyAmount || 0,
        date: startDate,
        recurrence: "monthly",
      });
      break;
    }

    case "depense_recurrente": {
      added.push({
        id: generateId("scenario"),
        name: input.name || "Nouvelle dépense récurrente",
        type: "depense_recurrente",
        category: "autre",
        flow: "expense",
        amount: input.monthlyAmount || 0,
        date: startDate,
        recurrence: "monthly",
      });
      break;
    }

    case "abonnement_suppression": {
      if (input.targetTransactionId) removedIds.add(input.targetTransactionId);
      break;
    }

    case "remboursement_anticipe": {
      const target = existingTransactions.find((t) => t.id === input.targetTransactionId);
      if (target?.installment) {
        const groupId = target.installment.groupId;
        const today = todayISO();
        let remainingAmount = 0;
        for (const tx of existingTransactions) {
          if (tx.installment?.groupId === groupId && tx.date > today) {
            removedIds.add(tx.id);
            remainingAmount += tx.amount;
          }
        }
        if (remainingAmount > 0) {
          added.push({
            id: generateId("scenario"),
            name: `Remboursement anticipé — ${target.name}`,
            type: "depense",
            category: target.category,
            flow: "expense",
            amount: remainingAmount,
            date: today,
            recurrence: "none",
          });
        }
      }
      break;
    }
  }

  return { added, removedIds };
}

const DELAY_CANDIDATES_DAYS = [7, 14, 21, 30, 45, 60];

function addDaysISO(dateISO: string, days: number): string {
  const d = new Date(dateISO + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Pour un achat qui met la situation en risque, teste quelques dates de
 * départ retardées et retourne la première qui repasse le mois le plus
 * difficile en "stable" — à l'image d'un conseil du coach du type
 * "attends deux semaines et le risque disparaît".
 */
function suggestBetterTimingForPurchase(
  input: ScenarioInput,
  existingTransactions: Transaction[],
  startingBalance: number,
  startingBalanceDate: string,
  months: number
): string | undefined {
  const baseStart = input.startDate || todayISO();

  for (const days of DELAY_CANDIDATES_DAYS) {
    const candidateStart = addDaysISO(baseStart, days);
    const candidateTransactions = [
      ...existingTransactions,
      ...buildInstallmentTransactions({
        name: input.name || "Achat simulé",
        price: input.price || 0,
        installmentsCount: Math.max(1, input.installmentsCount || 1),
        startDate: candidateStart,
      }),
    ];
    const forecast = getForecast(candidateTransactions, startingBalance, startingBalanceDate, months);
    const worst = forecast.reduce((min, m) => (m.soldeFinal < min.soldeFinal ? m : min), forecast[0]);

    if (riskFromBalance(worst.soldeFinal) === "stable") {
      return `Si tu attends jusqu'au ${formatDateShort(candidateStart)}, ton risque financier disparaît.`;
    }
  }

  return undefined;
}

export function simulateScenario(
  input: ScenarioInput,
  existingTransactions: Transaction[],
  startingBalance: number,
  startingBalanceDate: string,
  months = 6
): ScenarioResult {
  const baseline = getForecast(existingTransactions, startingBalance, startingBalanceDate, months);

  const { added, removedIds } = buildScenarioDiff(input, existingTransactions);
  const scenarioTransactions = [
    ...existingTransactions.filter((t) => !removedIds.has(t.id)),
    ...added,
  ];
  const scenario = getForecast(scenarioTransactions, startingBalance, startingBalanceDate, months);

  const worst = scenario.reduce((min, m) => (m.soldeFinal < min.soldeFinal ? m : min), scenario[0]);
  const risk = riskFromBalance(worst.soldeFinal);

  let message = "";
  if (risk === "stable") {
    message = "🟢 Cette évolution reste soutenable.";
  } else if (risk === "attention") {
    message = `🟠 Tu seras très juste en ${worst.monthLabel.toLowerCase()}.`;
  } else {
    message = `🔴 Tu risques un découvert en ${worst.monthLabel.toLowerCase()}.`;
  }

  const baselineEnd = baseline[baseline.length - 1]?.soldeFinal ?? 0;
  const scenarioEnd = scenario[scenario.length - 1]?.soldeFinal ?? 0;

  let suggestion: string | undefined;
  if (input.type === "achat" && risk !== "stable") {
    suggestion = suggestBetterTimingForPurchase(
      input,
      existingTransactions,
      startingBalance,
      startingBalanceDate,
      months
    );
  }

  return {
    baseline,
    scenario,
    message,
    risk,
    worstMonthLabel: worst.monthLabel,
    minBalance: worst.soldeFinal,
    deltaAtHorizon: scenarioEnd - baselineEnd,
    suggestion,
  };
}

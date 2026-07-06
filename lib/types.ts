// ============================================================================
// Types métier — FinAssist
// ============================================================================

/** Type de mouvement rapide proposé à l'ajout (détermine le sens par défaut). */
export type TransactionType =
  | "salaire"
  | "prime"
  | "remboursement"
  | "depense"
  | "facture"
  | "abonnement"
  | "achat_ponctuel"
  | "depense_recurrente"
  | "epargne";

export type Flow = "income" | "expense";

/** Étiquette de classification utilisée pour le coach et les regroupements. */
export type Category =
  | "restauration"
  | "transport"
  | "logement"
  | "abonnements"
  | "loisirs"
  | "sante"
  | "epargne"
  | "revenu"
  | "autre";

export type Recurrence = "none" | "weekly" | "monthly" | "yearly";

export interface InstallmentInfo {
  groupId: string;
  installmentIndex: number; // 1-based
  totalInstallments: number;
}

export interface Transaction {
  id: string;
  name: string;
  type: TransactionType;
  category: Category;
  flow: Flow;
  amount: number; // toujours positif ; le sens est donné par `flow`
  date: string; // ISO yyyy-mm-dd
  recurrence: Recurrence;
  note?: string;
  installment?: InstallmentInfo;
  goalId?: string; // si la transaction alimente un objectif d'épargne
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string; // ISO yyyy-mm-dd
  createdAt: string; // ISO yyyy-mm-dd
}

export type RiskLevel = "stable" | "attention" | "risque";

export interface MonthForecast {
  monthKey: string; // ex: "2026-08"
  monthLabel: string; // ex: "Août 2026"
  revenus: number;
  depenses: number;
  installments: number;
  epargne: number;
  soldeFinal: number;
  risk: RiskLevel;
}

export interface SimulationResult {
  soutenable: boolean;
  risk: RiskLevel;
  message: string;
  worstMonthLabel: string;
  minBalance: number;
  margin: number;
  forecast: MonthForecast[];
}

/** Une occurrence concrète d'une transaction au sein d'un mois donné (utile pour l'affichage détaillé). */
export interface MonthOccurrence {
  transaction: Transaction;
  occurrenceDate: string; // ISO yyyy-mm-dd
}

// ============================================================================
// Rappels intelligents
// ============================================================================

export type ReminderType = "abonnement" | "echeance" | "risque" | "epargne_stagnante";
export type ReminderSeverity = "info" | "warning" | "danger";

export interface Reminder {
  id: string;
  type: ReminderType;
  title: string;
  detail: string;
  severity: ReminderSeverity;
  date?: string; // ISO — date de l'échéance concernée, si applicable
}

// ============================================================================
// Carte "Reste à vivre"
// ============================================================================

export interface RemainingToLive {
  soldeActuel: number;
  revenusMois: number;
  depensesMois: number;
  depensesRestantes: number;
  disponibleFinMois: number;
  risk: RiskLevel;
}

// ============================================================================
// Simulations avancées (scénarios)
// ============================================================================

export type ScenarioType =
  | "achat"
  | "salaire"
  | "abonnement_ajout"
  | "abonnement_suppression"
  | "depense_recurrente"
  | "remboursement_anticipe";

export interface ScenarioResult {
  baseline: MonthForecast[];
  scenario: MonthForecast[];
  message: string;
  risk: RiskLevel;
  worstMonthLabel: string;
  minBalance: number;
  deltaAtHorizon: number; // impact sur le solde final de la période simulée
}

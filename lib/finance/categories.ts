import type { Category, Flow, Recurrence, TransactionType } from "@/lib/types";

export const TRANSACTION_TYPE_META: Record<
  TransactionType,
  { label: string; flow: Flow; defaultCategory: Category; defaultRecurrence: Recurrence }
> = {
  salaire: { label: "Salaire", flow: "income", defaultCategory: "revenu", defaultRecurrence: "monthly" },
  prime: { label: "Prime", flow: "income", defaultCategory: "revenu", defaultRecurrence: "none" },
  remboursement: { label: "Remboursement", flow: "income", defaultCategory: "revenu", defaultRecurrence: "none" },
  depense: { label: "Dépense", flow: "expense", defaultCategory: "autre", defaultRecurrence: "none" },
  facture: { label: "Facture", flow: "expense", defaultCategory: "logement", defaultRecurrence: "monthly" },
  abonnement: { label: "Abonnement", flow: "expense", defaultCategory: "abonnements", defaultRecurrence: "monthly" },
  achat_ponctuel: { label: "Achat ponctuel", flow: "expense", defaultCategory: "loisirs", defaultRecurrence: "none" },
  depense_recurrente: { label: "Dépense récurrente", flow: "expense", defaultCategory: "autre", defaultRecurrence: "monthly" },
  epargne: { label: "Versement épargne", flow: "expense", defaultCategory: "epargne", defaultRecurrence: "none" },
};

export const CATEGORY_META: Record<Category, { label: string; color: string }> = {
  restauration: { label: "Restauration", color: "#FF9F0A" },
  transport: { label: "Transport", color: "#0A84FF" },
  logement: { label: "Logement", color: "#5E5CE6" },
  abonnements: { label: "Abonnements", color: "#BF5AF2" },
  loisirs: { label: "Loisirs", color: "#FF375F" },
  sante: { label: "Santé", color: "#34C759" },
  epargne: { label: "Épargne", color: "#64D2FF" },
  revenu: { label: "Revenu", color: "#30D158" },
  autre: { label: "Autre", color: "#98989F" },
};

export const RECURRENCE_LABELS: Record<Recurrence, string> = {
  none: "Ponctuelle",
  weekly: "Toutes les semaines",
  monthly: "Tous les mois",
  yearly: "Tous les ans",
};

export const QUICK_ADD_TYPES: TransactionType[] = [
  "salaire",
  "prime",
  "remboursement",
  "depense",
  "facture",
  "abonnement",
  "achat_ponctuel",
  "depense_recurrente",
];

export const CATEGORY_OPTIONS: Category[] = [
  "restauration",
  "transport",
  "logement",
  "abonnements",
  "loisirs",
  "sante",
  "epargne",
  "revenu",
  "autre",
];

import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils/format";

export function BalanceCard({
  available,
  afterCommitments,
  forecast3Months,
  safeToSpend,
}: {
  available: number;
  afterCommitments: number;
  forecast3Months: number;
  safeToSpend: number;
}) {
  return (
    <Card className="animate-rise-in">
      <p className="text-sm font-medium text-muted-light dark:text-muted-dark">
        Disponible aujourd&rsquo;hui
      </p>
      <p className="tabular mt-1 text-5xl font-extrabold tracking-tight">
        {formatCurrency(available)}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 border-t border-line-light pt-5 dark:border-line-dark">
        <Row label="Après tous les engagements" value={afterCommitments} />
        <Row label="Prévision sur 3 mois" value={forecast3Months} />
        <Row label="Tu peux encore dépenser sans risque" value={safeToSpend} emphasize />
      </div>
    </Card>
  );
}

function Row({ label, value, emphasize }: { label: string; value: number; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-light dark:text-muted-dark">{label}</span>
      <span className={`tabular text-sm font-semibold ${emphasize ? "text-accent" : ""}`}>
        {formatCurrency(value)}
      </span>
    </div>
  );
}

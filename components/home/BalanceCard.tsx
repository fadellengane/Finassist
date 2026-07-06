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
      <p className="text-sm font-light text-muted-light dark:text-muted-dark">
        Disponible aujourd&rsquo;hui
      </p>
      <p className="tabular mt-2 text-5xl font-light tracking-tight">
        {formatCurrency(available)}
      </p>

      <div className="mt-8 space-y-3.5 border-t border-line-light pt-6 dark:border-line-dark">
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
      <span className="text-sm font-light text-muted-light dark:text-muted-dark">{label}</span>
      <span className={`tabular text-sm font-normal ${emphasize ? "text-accent" : ""}`}>
        {formatCurrency(value)}
      </span>
    </div>
  );
}

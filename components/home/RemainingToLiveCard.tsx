import { Card } from "@/components/ui/Card";
import { RemainingToLiveGauge } from "@/components/home/RemainingToLiveGauge";
import { formatCurrency } from "@/lib/utils/format";
import type { RemainingToLive } from "@/lib/types";

export function RemainingToLiveCard({ data }: { data: RemainingToLive }) {
  return (
    <Card className="!p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm font-light text-muted-light dark:text-muted-dark">Reste à vivre</p>
        <span className="tabular text-lg font-medium">{formatCurrency(data.disponibleFinMois)}</span>
      </div>

      <RemainingToLiveGauge amount={data.disponibleFinMois} risk={data.risk} />

      <div className="mt-6 grid grid-cols-2 gap-y-4 border-t border-line-light pt-5 dark:border-line-dark">
        <Metric label="Solde actuel" value={data.soldeActuel} />
        <Metric label="Revenus du mois" value={data.revenusMois} positive />
        <Metric label="Dépenses du mois" value={-data.depensesMois} />
        <Metric label="Dépenses restantes" value={-data.depensesRestantes} />
      </div>
    </Card>
  );
}

function Metric({ label, value, positive }: { label: string; value: number; positive?: boolean }) {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return (
    <div>
      <p className={`tabular text-sm font-medium ${positive ? "text-good" : ""}`}>
        {sign} {formatCurrency(Math.abs(value))}
      </p>
      <p className="text-xs font-light text-muted-light dark:text-muted-dark">{label}</p>
    </div>
  );
}

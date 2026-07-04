import type { SimulationResult } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils/format";

export function SimulatorResult({ result }: { result: SimulationResult }) {
  return (
    <Card className="animate-rise-in">
      <p className="text-lg font-bold leading-snug">{result.message}</p>

      <div className="mt-5 grid grid-cols-1 gap-3 border-t border-line-light pt-5 dark:border-line-dark">
        <Row label="Mois le plus difficile" value={result.worstMonthLabel} />
        <Row label="Solde minimum atteint" value={formatCurrency(result.minBalance)} />
        <Row label="Marge restante" value={formatCurrency(result.margin)} />
      </div>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-light dark:text-muted-dark">{label}</span>
      <span className="tabular font-semibold">{value}</span>
    </div>
  );
}

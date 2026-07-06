import { Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils/format";
import type { ScenarioResult } from "@/lib/types";

export function ScenarioResultCard({ result }: { result: ScenarioResult }) {
  const deltaSign = result.deltaAtHorizon >= 0 ? "+" : "−";

  return (
    <Card className="animate-rise-in">
      <p className="text-lg font-normal leading-snug">{result.message}</p>

      <div className="mt-6 space-y-3.5 border-t border-line-light pt-6 dark:border-line-dark">
        <Row label="Mois le plus difficile" value={result.worstMonthLabel} />
        <Row label="Solde minimum atteint" value={formatCurrency(result.minBalance)} />
        <Row
          label="Impact à l'horizon simulé"
          value={`${deltaSign} ${formatCurrency(Math.abs(result.deltaAtHorizon))}`}
        />
      </div>

      {result.suggestion && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-accent-soft p-4">
          <Lightbulb size={16} className="mt-0.5 shrink-0 text-accent" strokeWidth={1.75} />
          <p className="text-sm font-normal text-accent">{result.suggestion}</p>
        </div>
      )}
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="font-light text-muted-light dark:text-muted-dark">{label}</span>
      <span className="tabular font-medium">{value}</span>
    </div>
  );
}

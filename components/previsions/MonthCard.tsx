import type { MonthForecast } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils/format";

const RISK_DOT: Record<MonthForecast["risk"], string> = {
  stable: "bg-good",
  attention: "bg-warn",
  risque: "bg-bad",
};

export function MonthCard({ month }: { month: MonthForecast }) {
  return (
    <Card className="!p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${RISK_DOT[month.risk]}`} />
          <h3 className="text-[15px] font-bold">{month.monthLabel}</h3>
        </div>
        <span className="tabular text-[15px] font-bold">{formatCurrency(month.soldeFinal)}</span>
      </div>

      <div className="space-y-2">
        <Line label="Revenus" value={month.revenus} positive />
        <Line label="Dépenses" value={-month.depenses} />
        <Line label="Paiements en plusieurs fois" value={-month.installments} />
        <Line label="Épargne" value={-month.epargne} />
      </div>
    </Card>
  );
}

function Line({ label, value, positive }: { label: string; value: number; positive?: boolean }) {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-light dark:text-muted-dark">{label}</span>
      <span className={`tabular font-medium ${positive ? "text-good" : ""}`}>
        {sign} {formatCurrency(Math.abs(value))}
      </span>
    </div>
  );
}

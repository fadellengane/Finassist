import { ChevronRight } from "lucide-react";
import type { MonthForecast } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils/format";

const RISK_DOT: Record<MonthForecast["risk"], string> = {
  stable: "bg-good",
  attention: "bg-warn",
  risque: "bg-bad",
};

export function MonthCard({ month, onSelect }: { month: MonthForecast; onSelect: () => void }) {
  return (
    <button onClick={onSelect} className="block w-full text-left">
      <Card className="!p-6 transition-shadow hover:shadow-none">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${RISK_DOT[month.risk]}`} />
            <h3 className="text-[15px] font-normal">{month.monthLabel}</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="tabular text-[15px] font-medium">{formatCurrency(month.soldeFinal)}</span>
            <ChevronRight size={15} className="text-muted-light dark:text-muted-dark" />
          </div>
        </div>

        <div className="space-y-2.5">
          <Line label="Revenus" value={month.revenus} positive />
          <Line label="Dépenses" value={-month.depenses} />
          <Line label="Paiements en plusieurs fois" value={-month.installments} />
          <Line label="Épargne" value={-month.epargne} />
        </div>
      </Card>
    </button>
  );
}

function Line({ label, value, positive }: { label: string; value: number; positive?: boolean }) {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return (
    <div className="flex items-center justify-between text-sm font-light">
      <span className="text-muted-light dark:text-muted-dark">{label}</span>
      <span className={`tabular ${positive ? "text-good" : ""}`}>
        {sign} {formatCurrency(Math.abs(value))}
      </span>
    </div>
  );
}

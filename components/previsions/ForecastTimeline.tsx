import type { MonthForecast } from "@/lib/types";
import { MonthCard } from "@/components/previsions/MonthCard";

export function ForecastTimeline({
  months,
  onSelectMonth,
}: {
  months: MonthForecast[];
  onSelectMonth: (month: MonthForecast) => void;
}) {
  return (
    <div className="space-y-4">
      {months.map((month) => (
        <MonthCard key={month.monthKey} month={month} onSelect={() => onSelectMonth(month)} />
      ))}
    </div>
  );
}

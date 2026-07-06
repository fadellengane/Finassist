import type { MonthForecast } from "@/lib/types";
import { MonthCard } from "@/components/previsions/MonthCard";
import { Reveal } from "@/components/ui/Reveal";

export function ForecastTimeline({
  months,
  onSelectMonth,
}: {
  months: MonthForecast[];
  onSelectMonth: (month: MonthForecast) => void;
}) {
  return (
    <div className="space-y-4">
      {months.map((month, i) => (
        <Reveal key={month.monthKey} index={i}>
          <MonthCard month={month} onSelect={() => onSelectMonth(month)} />
        </Reveal>
      ))}
    </div>
  );
}

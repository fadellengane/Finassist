import type { MonthForecast } from "@/lib/types";
import { MonthCard } from "@/components/previsions/MonthCard";

export function ForecastTimeline({ months }: { months: MonthForecast[] }) {
  return (
    <div className="relative space-y-4 pl-4">
      <div className="absolute bottom-2 left-[7px] top-2 w-px bg-line-light dark:bg-line-dark" />
      {months.map((month) => (
        <div key={month.monthKey} className="relative">
          <MonthCard month={month} />
        </div>
      ))}
    </div>
  );
}

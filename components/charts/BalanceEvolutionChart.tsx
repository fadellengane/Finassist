"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/components/ThemeProvider";
import { CHART_COLORS, CHART_FONT, chartTooltipStyle } from "@/lib/ui/chartTheme";
import { formatCurrency } from "@/lib/utils/format";
import type { MonthForecast } from "@/lib/types";

export function BalanceEvolutionChart({ forecast }: { forecast: MonthForecast[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const data = forecast.map((m) => ({
    label: m.monthLabel.slice(0, 3),
    solde: Math.round(m.soldeFinal),
  }));

  return (
    <Card className="!p-6">
      <p className="mb-4 text-sm font-light text-muted-light dark:text-muted-dark">
        Évolution du solde prévue
      </p>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fontFamily: CHART_FONT, fill: CHART_COLORS.muted }}
          />
          <YAxis hide domain={["dataMin - 100", "dataMax + 100"]} />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), "Solde"]}
            contentStyle={{
              ...chartTooltipStyle,
              background: isDark ? "#1C1C1E" : "#FFFFFF",
              color: isDark ? "#F5F5F7" : "#161618",
            }}
            labelStyle={{ display: "none" }}
            cursor={{ stroke: CHART_COLORS.accent, strokeWidth: 1, strokeDasharray: "4 4" }}
          />
          <Line
            type="monotone"
            dataKey="solde"
            stroke={CHART_COLORS.accent}
            strokeWidth={2.5}
            dot={{ r: 3, fill: CHART_COLORS.accent, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            animationDuration={700}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

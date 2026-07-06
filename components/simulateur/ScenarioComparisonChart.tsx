"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/components/ThemeProvider";
import { CHART_COLORS, CHART_FONT, chartTooltipStyle } from "@/lib/ui/chartTheme";
import { formatCurrency } from "@/lib/utils/format";
import type { MonthForecast } from "@/lib/types";

export function ScenarioComparisonChart({
  baseline,
  scenario,
}: {
  baseline: MonthForecast[];
  scenario: MonthForecast[];
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const data = baseline.map((m, i) => ({
    label: m.monthLabel.slice(0, 3),
    "Sans changement": Math.round(m.soldeFinal),
    "Avec ce scénario": Math.round(scenario[i]?.soldeFinal ?? m.soldeFinal),
  }));

  return (
    <Card className="!p-6">
      <p className="mb-4 text-sm font-light text-muted-light dark:text-muted-dark">
        Impact sur ton solde
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fontFamily: CHART_FONT, fill: CHART_COLORS.muted }}
          />
          <YAxis hide />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              ...chartTooltipStyle,
              background: isDark ? "#1C1C1E" : "#FFFFFF",
              color: isDark ? "#F5F5F7" : "#161618",
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, fontFamily: CHART_FONT, fontWeight: 300, paddingTop: 12 }}
          />
          <Line
            type="monotone"
            dataKey="Sans changement"
            stroke={CHART_COLORS.muted}
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
            animationDuration={600}
          />
          <Line
            type="monotone"
            dataKey="Avec ce scénario"
            stroke={CHART_COLORS.accent}
            strokeWidth={2.5}
            dot={{ r: 3, fill: CHART_COLORS.accent, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            animationDuration={700}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

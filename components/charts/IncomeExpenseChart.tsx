"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/components/ThemeProvider";
import { CHART_COLORS, CHART_FONT, chartTooltipStyle } from "@/lib/ui/chartTheme";
import { formatCurrency } from "@/lib/utils/format";
import type { MonthForecast } from "@/lib/types";

export function IncomeExpenseChart({ forecast }: { forecast: MonthForecast[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const data = forecast.map((m) => ({
    label: m.monthLabel.slice(0, 3),
    Revenus: Math.round(m.revenus),
    Dépenses: Math.round(m.depenses + m.installments + m.epargne),
  }));

  return (
    <Card className="!p-6">
      <p className="mb-4 text-sm font-light text-muted-light dark:text-muted-dark">
        Revenus et dépenses par mois
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }} barGap={4}>
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
            cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, fontFamily: CHART_FONT, fontWeight: 300, paddingTop: 12 }}
          />
          <Bar dataKey="Revenus" fill={CHART_COLORS.good} radius={[6, 6, 6, 6]} animationDuration={700} />
          <Bar dataKey="Dépenses" fill={CHART_COLORS.accent} radius={[6, 6, 6, 6]} animationDuration={700} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

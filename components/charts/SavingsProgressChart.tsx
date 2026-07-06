"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/components/ThemeProvider";
import { getGoalProgress } from "@/lib/finance/goals";
import { CHART_COLORS, CHART_FONT, chartTooltipStyle } from "@/lib/ui/chartTheme";
import { formatCurrency } from "@/lib/utils/format";
import type { SavingsGoal, Transaction } from "@/lib/types";

export function SavingsProgressChart({
  goals,
  transactions,
}: {
  goals: SavingsGoal[];
  transactions: Transaction[];
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const data = goals.map((goal) => {
    const progress = getGoalProgress(goal, transactions);
    return {
      label: goal.name.length > 10 ? `${goal.name.slice(0, 9)}…` : goal.name,
      Épargné: Math.round(progress.currentAmount),
      Restant: Math.round(progress.remainingAmount),
    };
  });

  if (data.length === 0) return null;

  return (
    <Card className="!p-6">
      <p className="mb-4 text-sm font-light text-muted-light dark:text-muted-dark">
        Progression des objectifs
      </p>
      <ResponsiveContainer width="100%" height={Math.max(140, data.length * 56)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
          barSize={16}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            axisLine={false}
            tickLine={false}
            width={80}
            tick={{ fontSize: 12, fontFamily: CHART_FONT, fill: CHART_COLORS.muted }}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              ...chartTooltipStyle,
              background: isDark ? "#1C1C1E" : "#FFFFFF",
              color: isDark ? "#F5F5F7" : "#161618",
            }}
            cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}
          />
          <Bar
            dataKey="Épargné"
            stackId="a"
            fill={CHART_COLORS.accent}
            radius={[8, 0, 0, 8]}
            animationDuration={700}
          />
          <Bar
            dataKey="Restant"
            stackId="a"
            fill={isDark ? "#2C2C2E" : "#F0F0F3"}
            radius={[0, 8, 8, 0]}
            animationDuration={700}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

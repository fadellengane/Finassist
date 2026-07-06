"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/components/ThemeProvider";
import { CATEGORY_META } from "@/lib/finance/categories";
import { getTransactionsForMonth } from "@/lib/finance/engine";
import { chartTooltipStyle } from "@/lib/ui/chartTheme";
import { formatCurrency } from "@/lib/utils/format";
import type { Category, Transaction } from "@/lib/types";

export function CategoryBreakdownChart({ transactions }: { transactions: Transaction[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const totals = new Map<Category, number>();
  for (const { transaction } of getTransactionsForMonth(transactions, new Date())) {
    if (transaction.flow !== "expense" || transaction.category === "epargne") continue;
    totals.set(transaction.category, (totals.get(transaction.category) ?? 0) + transaction.amount);
  }

  const data = Array.from(totals.entries())
    .map(([category, value]) => ({
      name: CATEGORY_META[category].label,
      value: Math.round(value),
      color: CATEGORY_META[category].color,
    }))
    .sort((a, b) => b.value - a.value);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="!p-6">
      <p className="mb-4 text-sm font-light text-muted-light dark:text-muted-dark">
        Dépenses par catégorie ce mois-ci
      </p>

      {data.length === 0 ? (
        <p className="py-8 text-center text-sm font-light text-muted-light dark:text-muted-dark">
          Pas encore de dépense ce mois-ci.
        </p>
      ) : (
        <div className="flex items-center gap-6">
          <div className="relative h-[140px] w-[140px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={44}
                  outerRadius={68}
                  paddingAngle={2}
                  animationDuration={700}
                  animationEasing="ease-out"
                  stroke="none"
                >
                  {data.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    ...chartTooltipStyle,
                    background: isDark ? "#1C1C1E" : "#FFFFFF",
                    color: isDark ? "#F5F5F7" : "#161618",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="tabular text-sm font-medium">{formatCurrency(total)}</span>
              <span className="text-[10px] font-light text-muted-light dark:text-muted-dark">total</span>
            </div>
          </div>

          <div className="flex-1 space-y-2.5">
            {data.slice(0, 5).map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="font-light text-muted-light dark:text-muted-dark">{d.name}</span>
                </div>
                <span className="tabular font-medium">{formatCurrency(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

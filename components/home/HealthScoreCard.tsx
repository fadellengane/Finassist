"use client";

import { RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/components/ThemeProvider";
import { CHART_COLORS } from "@/lib/ui/chartTheme";
import type { HealthScore } from "@/lib/types";

function scoreColor(score: number): string {
  if (score >= 75) return CHART_COLORS.good;
  if (score >= 50) return CHART_COLORS.warn;
  return CHART_COLORS.bad;
}

export function HealthScoreCard({ health }: { health: HealthScore }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const color = scoreColor(health.score);

  const data = [{ name: "score", value: health.score, fill: color }];

  return (
    <Card className="!p-6">
      <p className="mb-4 text-sm font-light text-muted-light dark:text-muted-dark">
        Score de santé financière
      </p>

      <div className="flex items-center gap-6">
        <div className="relative h-[110px] w-[110px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={data}
              innerRadius="72%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              barSize={9}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={999}
                background={{ fill: isDark ? "#2C2C2E" : "#F0F0F3" }}
                animationDuration={800}
                animationEasing="ease-out"
                max={100}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="tabular text-2xl font-medium">{health.score}</span>
            <span className="text-[10px] font-light text-muted-light dark:text-muted-dark">/ 100</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {health.explanations.slice(0, 4).map((exp, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="mt-0.5 shrink-0">{exp.tone === "good" ? "✅" : "⚠️"}</span>
              <span className="font-light leading-snug text-muted-light dark:text-muted-dark">
                {exp.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

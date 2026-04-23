"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { IncomeSummary, IncomeCategory } from "@year-planner/types";
import { getCategoryLabel, getCategoryColor } from "@/lib/income";
import { formatCurrency } from "@/lib/utils";

interface CategoryChartProps {
  summary: IncomeSummary;
}

export function CategoryChart({ summary }: CategoryChartProps) {
  const data = (Object.keys(summary.byCategory) as IncomeCategory[])
    .map((category) => ({
      name: getCategoryLabel(category),
      value: summary.byCategory[category],
      color: getCategoryColor(category),
    }))
    .filter((item) => item.value > 0);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">카테고리별 수입</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px] text-muted-foreground">
          데이터가 없습니다
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">카테고리별 수입</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-sm">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

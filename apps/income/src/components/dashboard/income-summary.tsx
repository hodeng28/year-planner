"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { IncomeSummary } from "@year-planner/types";
import { getCategoryLabel } from "@/lib/income";
import { TrendingUp, Gift, ClipboardList, Star } from "lucide-react";

interface IncomeSummaryCardProps {
  summary: IncomeSummary;
  title: string;
}

const categoryIcons = {
  event: Gift,
  survey: ClipboardList,
  experience: Star,
};

export function IncomeSummaryCard({ summary, title }: IncomeSummaryCardProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">총 수입</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.total)}</div>
          <p className="text-xs text-muted-foreground">{title}</p>
        </CardContent>
      </Card>

      {(Object.keys(summary.byCategory) as Array<keyof typeof summary.byCategory>).map(
        (category) => {
          const Icon = categoryIcons[category];
          return (
            <Card key={category}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {getCategoryLabel(category)}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(summary.byCategory[category])}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary.total > 0
                    ? `${Math.round((summary.byCategory[category] / summary.total) * 100)}%`
                    : "0%"}
                </p>
              </CardContent>
            </Card>
          );
        }
      )}
    </div>
  );
}

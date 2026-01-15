'use client';

import { useMemo } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { GoalsSummary } from '@/components/dashboard/goals-summary';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { TodayTasks } from '@/components/dashboard/today-tasks';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { formatKoreanDate } from '@/lib/date';

export default function DashboardPage() {
  const { goals, todayTasks, isLoading, stats, today, toggleTaskStatus } =
    useDashboardData();

  const dateLabel = useMemo(() => formatKoreanDate(today), [today]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <p className="text-center text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <DashboardHeader dateLabel={dateLabel} />
      <StatsCards
        goalsCount={goals.length}
        progressPercent={stats.progressPercent}
        completedTasks={stats.completedTasks}
        totalTasks={stats.totalTasks}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <GoalsSummary goals={goals} />
        <TodayTasks tasks={todayTasks} onToggleTask={toggleTaskStatus} />
      </div>
    </div>
  );
}

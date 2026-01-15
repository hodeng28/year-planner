'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Goal, Task } from '@year-planner/types';
import { toast } from 'sonner';
import { goalsApi, tasksApi } from '@/lib/api';
import { getTodayIso } from '@/lib/date';

interface DashboardStats {
  completedTasks: number;
  totalTasks: number;
  progressPercent: number;
}

export function useDashboardData() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const today = useMemo(() => getTodayIso(), []);

  const fetchData = useCallback(async () => {
    try {
      const [goalsData, tasksData] = await Promise.all([
        goalsApi.getAll(),
        tasksApi.getByDate(today),
      ]);
      setGoals(goalsData);
      setTodayTasks(tasksData);
    } catch {
      toast.error('대시보드 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [today]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats: DashboardStats = useMemo(() => {
    const completedTasks = todayTasks.filter(
      (task) => task.status === 'completed'
    ).length;
    const totalTasks = todayTasks.length;
    const progressPercent =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return { completedTasks, totalTasks, progressPercent };
  }, [todayTasks]);

  const toggleTaskStatus = useCallback(async (task: Task) => {
    const newStatus: Task['status'] =
      task.status === 'completed' ? 'todo' : 'completed';
    const optimistic: Task = { ...task, status: newStatus };

    setTodayTasks((prev) =>
      prev.map((item) => (item.id === task.id ? optimistic : item))
    );

    try {
      const updated = await tasksApi.update(task.id, { status: newStatus });
      setTodayTasks((prev) =>
        prev.map((item) => (item.id === task.id ? updated : item))
      );
    } catch {
      setTodayTasks((prev) =>
        prev.map((item) => (item.id === task.id ? task : item))
      );
      toast.error('할 일 상태 변경에 실패했습니다.');
    }
  }, []);

  return {
    goals,
    todayTasks,
    isLoading,
    stats,
    today,
    toggleTaskStatus,
  };
}
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Task, TaskStatus } from '@year-planner/types';
import { tasksApi } from '@/lib/api';
import { TaskItem } from '@/components/tasks/task-item';
import { TaskForm } from '@/components/tasks/task-form';
import { CheckCircle2, ListTodo } from 'lucide-react';
import { toast } from 'sonner';
import { formatKoreanDate, getTodayIso } from '@/lib/date';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = getTodayIso();

  const fetchTasks = useCallback(async () => {
    try {
      const data = await tasksApi.getByDate(today);
      setTasks(data);
    } catch {
      toast.error('할 일을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [today]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreate = async (title: string) => {
    setIsSubmitting(true);
    try {
      const newTask = await tasksApi.create({ title, dueDate: today });
      setTasks((prev) => [newTask, ...prev]);
      toast.success('할 일이 추가되었습니다.');
    } catch {
      toast.error('할 일 추가에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    try {
      const updated = await tasksApi.update(id, { status });
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      if (status === 'completed') {
        toast.success('완료되었습니다!');
      }
    } catch {
      toast.error('상태 변경에 실패했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await tasksApi.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success('할 일이 삭제되었습니다.');
    } catch {
      toast.error('삭제에 실패했습니다.');
    }
  };

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const formatDate = (dateStr: string) => formatKoreanDate(dateStr);

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ListTodo className="h-8 w-8" />
          <h1 className="text-2xl font-bold">오늘 할 일</h1>
        </div>
        <p className="text-muted-foreground">{formatDate(today)}</p>
      </div>

      {/* Progress */}
      <div className="mb-6 p-4 bg-accent/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">오늘의 진행률</span>
          <span className="text-sm text-muted-foreground">
            {completedCount} / {totalCount} 완료
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {totalCount > 0 && completedCount === totalCount && (
          <div className="flex items-center gap-2 mt-3 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>모든 할 일을 완료했습니다!</span>
          </div>
        )}
      </div>

      {/* Add Task Form */}
      <div className="mb-6">
        <TaskForm onSubmit={handleCreate} isLoading={isSubmitting} />
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ListTodo className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            오늘 할 일이 없습니다. 새로운 할 일을 추가해보세요!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

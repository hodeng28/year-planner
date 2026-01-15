'use client';

import Link from 'next/link';
import type { Task } from '@year-planner/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { CheckCircle2, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TodayTasksProps {
  tasks: Task[];
  onToggleTask: (task: Task) => void;
}

export function TodayTasks({ tasks, onToggleTask }: TodayTasksProps) {
  const completedTasks = tasks.filter((task) => task.status === 'completed');
  const totalTasks = tasks.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="h-5 w-5" />
            <CardTitle>오늘 할 일</CardTitle>
          </div>
          <Link href="/tasks">
            <Button variant="outline" size="sm">
              전체 보기
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <ListTodo className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              오늘 할 일이 없습니다
            </p>
            <Link href="/tasks">
              <Button>할 일 추가</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {completedTasks.length === totalTasks && totalTasks > 0 && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg text-green-600 dark:text-green-400 mb-4">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">모든 할 일을 완료했습니다!</span>
              </div>
            )}
            {tasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                role="button"
                tabIndex={0}
                className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={(event) => {
                  const target = event.target as HTMLElement;
                  if (target.closest('[data-role="task-checkbox"]')) return;
                  onToggleTask(task);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onToggleTask(task);
                  }
                }}
              >
                <Checkbox
                  data-role="task-checkbox"
                  checked={task.status === 'completed'}
                  onCheckedChange={() => onToggleTask(task)}
                  aria-label={`${task.title} 완료 토글`}
                />
                <span
                  className={cn(
                    'flex-1 truncate',
                    task.status === 'completed' &&
                      'line-through text-muted-foreground'
                  )}
                >
                  {task.title}
                </span>
                {task.status === 'completed' && (
                  <Badge variant="default" className="text-xs">
                    완료
                  </Badge>
                )}
              </div>
            ))}
            {tasks.length > 5 && (
              <p className="text-sm text-muted-foreground text-center pt-2">
                +{tasks.length - 5}개 더 보기
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
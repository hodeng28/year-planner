'use client';

import type { Task, TaskStatus } from '@year-planner/types';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusLabels: Record<TaskStatus, string> = {
  todo: '할 일',
  in_progress: '진행 중',
  completed: '완료',
  on_hold: '보류',
};

const statusVariants: Record<
  TaskStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  todo: 'outline',
  in_progress: 'secondary',
  completed: 'default',
  on_hold: 'destructive',
};

interface TaskItemProps {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onStatusChange, onDelete }: TaskItemProps) {
  const isCompleted = task.status === 'completed';

  const handleCheckChange = (checked: boolean) => {
    onStatusChange(task.id, checked ? 'completed' : 'todo');
  };

  return (
    <div className="flex items-center gap-3 p-4 border rounded-lg group hover:bg-accent/50 transition-colors">
      <Checkbox
        checked={isCompleted}
        onCheckedChange={handleCheckChange}
        className="h-5 w-5"
      />
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'font-medium truncate',
            isCompleted && 'line-through text-muted-foreground'
          )}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="text-sm text-muted-foreground truncate">
            {task.description}
          </p>
        )}
      </div>
      <Badge variant={statusVariants[task.status]}>
        {statusLabels[task.status]}
      </Badge>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
        onClick={() => onDelete(task.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

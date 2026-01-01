export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'on_hold';

export interface Task {
  id: string;
  planId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskDto {
  planId?: string;
  title: string;
  description?: string;
  dueDate?: Date;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: Date;
}


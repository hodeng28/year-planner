import type { Goal, CreateGoalDto, UpdateGoalDto, Task, TaskStatus } from '@year-planner/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// API에서 dueDate는 ISO string으로 전달
interface CreateTaskInput {
  planId?: string;
  title: string;
  description?: string;
  dueDate?: string;
}

interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: string | null;
}

interface ApiResponse<T> {
  data: T;
}

interface ApiError {
  error: {
    code: string;
    message: string;
    details: unknown[];
  };
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errorData = (await res.json()) as ApiError;
    throw new Error(errorData.error.message);
  }

  // DELETE는 204 No Content 반환
  if (res.status === 204) {
    return undefined as T;
  }

  const json = (await res.json()) as ApiResponse<T>;
  return json.data;
}

// Goal API
export const goalsApi = {
  getAll: () => fetchApi<Goal[]>('/goals'),
  getById: (id: string) => fetchApi<Goal>(`/goals/${id}`),
  create: (data: CreateGoalDto) =>
    fetchApi<Goal>('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateGoalDto) =>
    fetchApi<Goal>(`/goals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<void>(`/goals/${id}`, { method: 'DELETE' }),
};

// Task API
export const tasksApi = {
  getAll: () => fetchApi<Task[]>('/tasks'),
  getByDate: (date: string) => fetchApi<Task[]>(`/tasks?date=${date}`),
  getById: (id: string) => fetchApi<Task>(`/tasks/${id}`),
  create: (data: CreateTaskInput) =>
    fetchApi<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateTaskInput) =>
    fetchApi<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<void>(`/tasks/${id}`, { method: 'DELETE' }),
};

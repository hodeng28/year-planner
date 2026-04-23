import type { IncomeItem, CreateIncomeInput, UpdateIncomeInput } from "@year-planner/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export const incomeApi = {
  getAll: (): Promise<IncomeItem[]> => fetchApi<IncomeItem[]>("/api/income"),

  getById: (id: string): Promise<IncomeItem> =>
    fetchApi<IncomeItem>(`/api/income/${id}`),

  create: (data: CreateIncomeInput): Promise<IncomeItem> =>
    fetchApi<IncomeItem>("/api/income", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateIncomeInput): Promise<IncomeItem> =>
    fetchApi<IncomeItem>(`/api/income/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    fetchApi<void>(`/api/income/${id}`, {
      method: "DELETE",
    }),
};

import { useQuery } from '@tanstack/react-query';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface Summary {
  totalTrades: number;
  totalProfit: number;
  totalFees: number;
  totalNetProfit: number;
  winRate: number;
  wins: number;
  losses: number;
}

interface MonthlyStats {
  month: string;
  profit: number;
  trades: number;
}

async function fetchWithData<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = await res.json();
  return json.data;
}

export function useSummary() {
  return useQuery({
    queryKey: ['stats', 'summary'],
    queryFn: () => fetchWithData<Summary>(`${API_BASE}/stats/summary`),
  });
}

export function useMonthlyStats() {
  return useQuery({
    queryKey: ['stats', 'monthly'],
    queryFn: () => fetchWithData<MonthlyStats[]>(`${API_BASE}/stats/monthly`),
  });
}

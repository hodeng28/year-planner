import { useQuery } from '@tanstack/react-query';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function useSummary() {
  return useQuery({
    queryKey: ['stats', 'summary'],
    queryFn: () => fetch(`${API_BASE}/stats/summary`).then((r) => r.json()),
  });
}

export function useMonthlyStats() {
  return useQuery({
    queryKey: ['stats', 'monthly'],
    queryFn: () => fetch(`${API_BASE}/stats/monthly`).then((r) => r.json()),
  });
}

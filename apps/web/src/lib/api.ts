const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface Trade {
  id: string;
  stockCode: string;
  stockName: string;
  type: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  tradedAt: string;
  targetPrice?: number;
  stopLossPrice?: number;
  emotionId?: string;
  emotion?: Option;
  patternId?: string;
  pattern?: Option;
  strategyId?: string;
  strategy?: Option;
  memo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Option {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateTradeInput {
  stockCode: string;
  stockName: string;
  type: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  tradedAt: string;
  targetPrice?: number;
  stopLossPrice?: number;
  emotionId?: string;
  patternId?: string;
  strategyId?: string;
  memo?: string;
}

export interface UpdateTradeInput extends Partial<CreateTradeInput> {}

export interface TradeFilters {
  startDate?: string;
  endDate?: string;
  stockCode?: string;
  type?: 'BUY' | 'SELL';
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

function buildQueryString(params: Record<string, string | undefined>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, value);
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

export const api = {
  trades: {
    list: (filters?: TradeFilters) => {
      const query = filters ? buildQueryString(filters as Record<string, string | undefined>) : '';
      return fetchApi<Trade[]>(`/trades${query}`);
    },
    get: (id: string) => fetchApi<Trade>(`/trades/${id}`),
    create: (data: CreateTradeInput) =>
      fetchApi<Trade>('/trades', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: UpdateTradeInput) =>
      fetchApi<Trade>(`/trades/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchApi<void>(`/trades/${id}`, { method: 'DELETE' }),
  },
  options: {
    emotions: () => fetchApi<Option[]>('/options/emotions'),
    patterns: () => fetchApi<Option[]>('/options/patterns'),
    strategies: () => fetchApi<Option[]>('/options/strategies'),
  },
};

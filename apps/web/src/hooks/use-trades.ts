import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, TradeFilters, CreateTradeInput, UpdateTradeInput } from '@/lib/api';

export function useTrades(filters?: TradeFilters) {
  return useQuery({
    queryKey: ['trades', filters],
    queryFn: () => api.trades.list(filters),
  });
}

export function useTrade(id: string) {
  return useQuery({
    queryKey: ['trades', id],
    queryFn: () => api.trades.get(id),
    enabled: !!id,
  });
}

export function useCreateTrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTradeInput) => api.trades.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
    },
  });
}

export function useUpdateTrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTradeInput }) =>
      api.trades.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
    },
  });
}

export function useDeleteTrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.trades.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
    },
  });
}

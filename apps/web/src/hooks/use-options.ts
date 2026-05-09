import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useEmotions() {
  return useQuery({
    queryKey: ['emotions'],
    queryFn: api.options.emotions,
    staleTime: 1000 * 60 * 5, // 5 minutes - options change infrequently
  });
}

export function usePatterns() {
  return useQuery({
    queryKey: ['patterns'],
    queryFn: api.options.patterns,
    staleTime: 1000 * 60 * 5,
  });
}

export function useStrategies() {
  return useQuery({
    queryKey: ['strategies'],
    queryFn: api.options.strategies,
    staleTime: 1000 * 60 * 5,
  });
}

// Combined hook for fetching all options at once
export function useAllOptions() {
  const emotions = useEmotions();
  const patterns = usePatterns();
  const strategies = useStrategies();

  return {
    emotions: emotions.data ?? [],
    patterns: patterns.data ?? [],
    strategies: strategies.data ?? [],
    isLoading: emotions.isLoading || patterns.isLoading || strategies.isLoading,
    isError: emotions.isError || patterns.isError || strategies.isError,
  };
}

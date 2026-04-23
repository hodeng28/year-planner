"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { incomeApi } from "@/lib/api";
import type { CreateIncomeInput, UpdateIncomeInput } from "@year-planner/types";

const INCOME_QUERY_KEY = ["income"];

export function useIncomeList() {
  return useQuery({
    queryKey: INCOME_QUERY_KEY,
    queryFn: incomeApi.getAll,
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIncomeInput) => incomeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INCOME_QUERY_KEY });
    },
  });
}

export function useUpdateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIncomeInput }) =>
      incomeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INCOME_QUERY_KEY });
    },
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => incomeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INCOME_QUERY_KEY });
    },
  });
}

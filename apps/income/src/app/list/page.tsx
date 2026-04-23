"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { IncomeForm } from "@/components/income/income-form";
import { IncomeList } from "@/components/income/income-list";

import { useIncomeList, useCreateIncome, useUpdateIncome, useDeleteIncome } from "@/hooks/use-income";
import type { IncomeItem, CreateIncomeInput } from "@year-planner/types";

export default function ListPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IncomeItem | undefined>();

  const { data: incomeList = [], isLoading } = useIncomeList();
  const createMutation = useCreateIncome();
  const updateMutation = useUpdateIncome();
  const deleteMutation = useDeleteIncome();

  const handleOpenForm = (item?: IncomeItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(undefined);
  };

  const handleSubmit = async (data: CreateIncomeInput) => {
    try {
      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, data });
        toast.success("수입이 수정되었습니다");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("수입이 추가되었습니다");
      }
      handleCloseForm();
    } catch {
      toast.error("오류가 발생했습니다");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("수입이 삭제되었습니다");
    } catch {
      toast.error("삭제 중 오류가 발생했습니다");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">전체 수입 목록</h1>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">추가</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
      ) : (
        <div>
          <p className="text-muted-foreground mb-4">
            총 {incomeList.length}건의 수입 기록
          </p>
          <IncomeList
            items={incomeList}
            onEdit={handleOpenForm}
            onDelete={handleDelete}
          />
        </div>
      )}

      <IncomeForm
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        onSubmit={handleSubmit}
        initialData={editingItem}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}

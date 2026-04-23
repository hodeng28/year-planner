"use client";

import { useState, useMemo } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  addYears,
  subYears,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from "date-fns";

import { Button } from "@/components/ui/button";
import { ViewToggle } from "@/components/dashboard/view-toggle";
import { IncomeSummaryCard } from "@/components/dashboard/income-summary";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { TimelineChart } from "@/components/dashboard/timeline-chart";
import { IncomeForm } from "@/components/income/income-form";
import { IncomeList } from "@/components/income/income-list";

import { useIncomeList, useCreateIncome, useUpdateIncome, useDeleteIncome } from "@/hooks/use-income";
import { calculateIncomeSummary, filterIncomeByView } from "@/lib/income";
import { getViewTitle } from "@/lib/date";
import type { ViewMode, IncomeItem, CreateIncomeInput } from "@year-planner/types";

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IncomeItem | undefined>();

  const { data: incomeList = [], isLoading } = useIncomeList();
  const createMutation = useCreateIncome();
  const updateMutation = useUpdateIncome();
  const deleteMutation = useDeleteIncome();

  const summary = useMemo(
    () => calculateIncomeSummary(incomeList, currentDate, viewMode),
    [incomeList, currentDate, viewMode]
  );

  const filteredItems = useMemo(
    () => filterIncomeByView(incomeList, currentDate, viewMode),
    [incomeList, currentDate, viewMode]
  );

  const navigatePrev = () => {
    switch (viewMode) {
      case "year":
        setCurrentDate((d) => subYears(d, 1));
        break;
      case "month":
        setCurrentDate((d) => subMonths(d, 1));
        break;
      case "week":
        setCurrentDate((d) => subWeeks(d, 1));
        break;
      case "day":
        setCurrentDate((d) => subDays(d, 1));
        break;
    }
  };

  const navigateNext = () => {
    switch (viewMode) {
      case "year":
        setCurrentDate((d) => addYears(d, 1));
        break;
      case "month":
        setCurrentDate((d) => addMonths(d, 1));
        break;
      case "week":
        setCurrentDate((d) => addWeeks(d, 1));
        break;
      case "day":
        setCurrentDate((d) => addDays(d, 1));
        break;
    }
  };

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

  const viewTitle = getViewTitle(currentDate, viewMode);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={navigatePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold min-w-[140px] text-center">{viewTitle}</h1>
          <Button variant="outline" size="icon" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle value={viewMode} onChange={setViewMode} />
          <Button onClick={() => handleOpenForm()}>
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">추가</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
      ) : (
        <>
          <IncomeSummaryCard summary={summary} title={viewTitle} />

          <div className="grid gap-4 lg:grid-cols-2">
            <CategoryChart summary={summary} />
            <TimelineChart summary={summary} />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">
              {viewTitle} 수입 목록 ({filteredItems.length}건)
            </h2>
            <IncomeList
              items={filteredItems}
              onEdit={handleOpenForm}
              onDelete={handleDelete}
            />
          </div>
        </>
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

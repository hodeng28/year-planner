"use client";

import type { IncomeItem } from "@year-planner/types";
import { IncomeItemRow } from "./income-item";
import { sortIncomeByDate } from "@/lib/income";

interface IncomeListProps {
  items: IncomeItem[];
  onEdit: (item: IncomeItem) => void;
  onDelete: (id: string) => void;
}

export function IncomeList({ items, onEdit, onDelete }: IncomeListProps) {
  const sortedItems = sortIncomeByDate(items);

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        등록된 수입이 없습니다
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sortedItems.map((item) => (
        <IncomeItemRow
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { IncomeItem, IncomeCategory } from "@year-planner/types";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/date";
import { getCategoryLabel } from "@/lib/income";
import { Pencil, Trash2 } from "lucide-react";

interface IncomeItemRowProps {
  item: IncomeItem;
  onEdit: (item: IncomeItem) => void;
  onDelete: (id: string) => void;
}

function getBadgeVariant(category: IncomeCategory) {
  switch (category) {
    case "event":
      return "event" as const;
    case "survey":
      return "survey" as const;
    case "experience":
      return "experience" as const;
  }
}

export function IncomeItemRow({ item, onEdit, onDelete }: IncomeItemRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant={getBadgeVariant(item.category)}>
            {getCategoryLabel(item.category)}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {formatDate(item.date, "yyyy.MM.dd")}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold">{formatCurrency(item.amount)}</span>
          {item.memo && (
            <span className="text-sm text-muted-foreground truncate">{item.memo}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(item)}
          aria-label="수정"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(item.id)}
          aria-label="삭제"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

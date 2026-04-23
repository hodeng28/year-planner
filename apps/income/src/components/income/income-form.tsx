"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IncomeItem, IncomeCategory, CreateIncomeInput } from "@year-planner/types";
import { INCOME_CATEGORIES } from "@year-planner/types";
import { getTodayString } from "@/lib/date";

interface IncomeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateIncomeInput) => void;
  initialData?: IncomeItem;
  isLoading?: boolean;
}

export function IncomeForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: IncomeFormProps) {
  const [category, setCategory] = useState<IncomeCategory>("event");
  const [date, setDate] = useState(getTodayString());
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category);
      setDate(initialData.date);
      setAmount(initialData.amount.toString());
      setMemo(initialData.memo || "");
    } else {
      setCategory("event");
      setDate(getTodayString());
      setAmount("");
      setMemo("");
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    onSubmit({
      category,
      date,
      amount: parsedAmount,
      memo: memo.trim() || undefined,
    });
  };

  const isValid = category && date && amount && parseInt(amount, 10) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "수입 수정" : "수입 추가"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category">카테고리</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as IncomeCategory)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {INCOME_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">날짜</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">금액 (원)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={1}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="memo">메모 (선택)</Label>
              <Input
                id="memo"
                placeholder="메모를 입력하세요"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={!isValid || isLoading}>
              {isLoading ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

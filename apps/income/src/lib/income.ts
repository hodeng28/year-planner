import type { IncomeItem, IncomeCategory, IncomeSummary, ViewMode } from "@year-planner/types";
import { getDateRangeForView, getTimelineLabels, isDateInRange } from "./date";

export function filterIncomeByView(
  items: IncomeItem[],
  date: Date,
  view: ViewMode
): IncomeItem[] {
  const { start, end } = getDateRangeForView(date, view);
  return items.filter((item) => isDateInRange(item.date, start, end));
}

export function calculateIncomeSummary(
  items: IncomeItem[],
  date: Date,
  view: ViewMode
): IncomeSummary {
  const filteredItems = filterIncomeByView(items, date, view);

  const total = filteredItems.reduce((sum, item) => sum + item.amount, 0);

  const byCategory: Record<IncomeCategory, number> = {
    event: 0,
    survey: 0,
    experience: 0,
  };

  filteredItems.forEach((item) => {
    byCategory[item.category] += item.amount;
  });

  const timelineLabels = getTimelineLabels(date, view);
  const timeline = timelineLabels.map(({ label, start, end }) => {
    const amount = filteredItems
      .filter((item) => isDateInRange(item.date, start, end))
      .reduce((sum, item) => sum + item.amount, 0);
    return { label, amount };
  });

  return { total, byCategory, timeline };
}

export function sortIncomeByDate(items: IncomeItem[], desc: boolean = true): IncomeItem[] {
  return [...items].sort((a, b) => {
    const comparison = a.date.localeCompare(b.date);
    return desc ? -comparison : comparison;
  });
}

export function getCategoryColor(category: IncomeCategory): string {
  switch (category) {
    case "event":
      return "var(--chart-1)";
    case "survey":
      return "var(--chart-2)";
    case "experience":
      return "var(--chart-3)";
  }
}

export function getCategoryLabel(category: IncomeCategory): string {
  switch (category) {
    case "event":
      return "이벤트";
    case "survey":
      return "설문/좌담회";
    case "experience":
      return "체험단";
  }
}

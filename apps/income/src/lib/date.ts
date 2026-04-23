import {
  format,
  startOfYear,
  endOfYear,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  eachMonthOfInterval,
  eachWeekOfInterval,
  eachDayOfInterval,
  isWithinInterval,
  parseISO,
} from "date-fns";
import { ko } from "date-fns/locale";
import type { ViewMode } from "@year-planner/types";

export function formatDate(date: string | Date, formatStr: string = "yyyy-MM-dd"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, formatStr, { locale: ko });
}

export function getDateRangeForView(date: Date, view: ViewMode): { start: Date; end: Date } {
  switch (view) {
    case "year":
      return { start: startOfYear(date), end: endOfYear(date) };
    case "month":
      return { start: startOfMonth(date), end: endOfMonth(date) };
    case "week":
      return { start: startOfWeek(date, { locale: ko }), end: endOfWeek(date, { locale: ko }) };
    case "day":
      return { start: startOfDay(date), end: endOfDay(date) };
  }
}

export function getTimelineLabels(
  date: Date,
  view: ViewMode
): { label: string; start: Date; end: Date }[] {
  const range = getDateRangeForView(date, view);

  switch (view) {
    case "year":
      return eachMonthOfInterval(range).map((d) => ({
        label: format(d, "M월", { locale: ko }),
        start: startOfMonth(d),
        end: endOfMonth(d),
      }));
    case "month":
      return eachWeekOfInterval(range, { locale: ko }).map((d, idx) => ({
        label: `${idx + 1}주`,
        start: startOfWeek(d, { locale: ko }),
        end: endOfWeek(d, { locale: ko }),
      }));
    case "week":
      return eachDayOfInterval(range).map((d) => ({
        label: format(d, "E", { locale: ko }),
        start: startOfDay(d),
        end: endOfDay(d),
      }));
    case "day":
      return [
        {
          label: format(date, "M/d", { locale: ko }),
          start: startOfDay(date),
          end: endOfDay(date),
        },
      ];
  }
}

export function isDateInRange(date: string, start: Date, end: Date): boolean {
  const d = parseISO(date);
  return isWithinInterval(d, { start, end });
}

export function getViewTitle(date: Date, view: ViewMode): string {
  switch (view) {
    case "year":
      return format(date, "yyyy년", { locale: ko });
    case "month":
      return format(date, "yyyy년 M월", { locale: ko });
    case "week":
      const weekStart = startOfWeek(date, { locale: ko });
      const weekEnd = endOfWeek(date, { locale: ko });
      return `${format(weekStart, "M/d", { locale: ko })} - ${format(weekEnd, "M/d", { locale: ko })}`;
    case "day":
      return format(date, "yyyy년 M월 d일 (E)", { locale: ko });
  }
}

export function getTodayString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

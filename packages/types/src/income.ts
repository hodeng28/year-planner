export type IncomeCategory = "event" | "survey" | "experience";

export interface IncomeItem {
  id: string;
  category: IncomeCategory;
  date: string; // YYYY-MM-DD
  amount: number; // integer currency value
  memo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateIncomeInput {
  category: IncomeCategory;
  date: string;
  amount: number;
  memo?: string;
}

export interface UpdateIncomeInput {
  category?: IncomeCategory;
  date?: string;
  amount?: number;
  memo?: string;
}

export interface IncomeSummary {
  total: number;
  byCategory: Record<IncomeCategory, number>;
  timeline: {
    label: string;
    amount: number;
  }[];
}

export type ViewMode = "year" | "month" | "week" | "day";

export const INCOME_CATEGORIES: { value: IncomeCategory; label: string }[] = [
  { value: "event", label: "이벤트" },
  { value: "survey", label: "설문/좌담회" },
  { value: "experience", label: "체험단" },
];

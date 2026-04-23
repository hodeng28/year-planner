"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ViewMode } from "@year-planner/types";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
}

const viewOptions: { value: ViewMode; label: string }[] = [
  { value: "year", label: "연간" },
  { value: "month", label: "월간" },
  { value: "week", label: "주간" },
  { value: "day", label: "일간" },
];

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as ViewMode)}>
      <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:inline-grid">
        {viewOptions.map((option) => (
          <TabsTrigger key={option.value} value={option.value}>
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

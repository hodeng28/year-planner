'use client';

import { Calendar } from 'lucide-react';

interface DashboardHeaderProps {
  dateLabel: string;
}

export function DashboardHeader({ dateLabel }: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2">안녕하세요!</h1>
      <p className="text-muted-foreground flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        {dateLabel}
      </p>
    </div>
  );
}
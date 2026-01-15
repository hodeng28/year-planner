'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface StatsCardsProps {
  goalsCount: number;
  progressPercent: number;
  completedTasks: number;
  totalTasks: number;
}

export function StatsCards({
  goalsCount,
  progressPercent,
  completedTasks,
  totalTasks,
}: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>등록된 목표</CardDescription>
          <CardTitle className="text-4xl">{goalsCount}</CardTitle>
        </CardHeader>
        <CardContent>
          <Link href="/goals">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2">
              목표 관리
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>오늘의 진행률</CardDescription>
          <CardTitle className="text-4xl">{progressPercent}%</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {completedTasks} / {totalTasks} 완료
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader className="pb-2">
          <CardDescription>오늘 할 일</CardDescription>
          <CardTitle className="text-4xl">{totalTasks}</CardTitle>
        </CardHeader>
        <CardContent>
          <Link href="/tasks">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2">
              할 일 관리
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
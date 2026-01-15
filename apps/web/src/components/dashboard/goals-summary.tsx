'use client';

import Link from 'next/link';
import type { Goal } from '@year-planner/types';
import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';

interface GoalsSummaryProps {
  goals: Goal[];
}

export function GoalsSummary({ goals }: GoalsSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            <CardTitle>나의 목표</CardTitle>
          </div>
          <Link href="/goals">
            <Button variant="outline" size="sm">
              전체 보기
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              등록된 목표가 없습니다
            </p>
            <Link href="/goals">
              <Button>목표 만들기</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.slice(0, 5).map((goal) => (
              <div
                key={goal.id}
                className="flex items-start gap-3 p-3 rounded-lg border"
              >
                <Target className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{goal.title}</p>
                  {goal.description && (
                    <p className="text-sm text-muted-foreground truncate">
                      {goal.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {goals.length > 5 && (
              <p className="text-sm text-muted-foreground text-center pt-2">
                +{goals.length - 5}개 더 보기
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
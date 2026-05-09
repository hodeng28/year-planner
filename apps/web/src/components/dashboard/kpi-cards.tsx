'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSummary } from '@/hooks/use-stats';

export function KpiCards() {
  const { data, isLoading } = useSummary();

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">총 수익</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${data?.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {data?.totalProfit?.toLocaleString()}원
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">승률</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{data?.winRate?.toFixed(1)}%</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">승</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-500">{data?.wins}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">패</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-500">{data?.losses}</p>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSummary } from '@/hooks/use-stats';

export function KpiCards() {
  const { data, isLoading } = useSummary();

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">순수익 (세후)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${(data?.totalNetProfit ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {(data?.totalNetProfit ?? 0).toLocaleString()}원
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">승률</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{(data?.winRate ?? 0).toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">승</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">{data?.wins ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">패</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">{data?.losses ?? 0}</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">세전 수익</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-xl font-bold ${(data?.totalProfit ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {(data?.totalProfit ?? 0).toLocaleString()}원
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">총 수수료</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-orange-500">
              -{(data?.totalFees ?? 0).toLocaleString()}원
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

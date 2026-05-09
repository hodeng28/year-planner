'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMonthlyStats } from '@/hooks/use-stats';

export function ProfitChart() {
  const { data, isLoading } = useMonthlyStats();

  if (isLoading) return <div>로딩 중...</div>;
  if (!data?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>월별 수익</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `${Number(value).toLocaleString()}원`} />
              <Bar dataKey="profit">
                {data.map((entry: { profit: number }, index: number) => (
                  <Cell key={index} fill={entry.profit >= 0 ? '#22c55e' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

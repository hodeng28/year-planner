'use client';

import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTrades, useDeleteTrade } from '@/hooks/use-trades';
import type { Trade } from '@/lib/api';

export function TradeList() {
  const { data: trades, isLoading } = useTrades();
  const deleteTrade = useDeleteTrade();

  if (isLoading) return <div>로딩 중...</div>;
  if (!trades?.length) return <div className="text-muted-foreground">매매 기록이 없습니다.</div>;

  return (
    <div className="space-y-2">
      {trades.map((trade: Trade) => (
        <div key={trade.id} className="border rounded-lg p-4 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{trade.stockName}</span>
              <Badge variant={trade.type === 'BUY' ? 'default' : 'destructive'}>
                {trade.type === 'BUY' ? '매수' : '매도'}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {format(new Date(trade.tradedAt), 'yyyy-MM-dd')} · {trade.price.toLocaleString()}원 × {trade.quantity}주
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => deleteTrade.mutate(trade.id)}>
            삭제
          </Button>
        </div>
      ))}
    </div>
  );
}

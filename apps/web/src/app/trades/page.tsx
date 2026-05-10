'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TradeForm } from '@/components/trades/trade-form';
import { TradeList } from '@/components/trades/trade-list';
import type { Trade } from '@/lib/api';

export default function TradesPage() {
  const [open, setOpen] = useState(false);
  const [sellTarget, setSellTarget] = useState<Trade | null>(null);

  const handleBuyClick = (trade: Trade) => {
    setSellTarget(trade);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSellTarget(null);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      handleClose();
    } else {
      setOpen(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">매매 기록</h2>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger render={<Button />}>
            + 매매 등록
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{sellTarget ? '매도 등록' : '새 매매 등록'}</DialogTitle>
            </DialogHeader>
            <TradeForm
              onSuccess={handleClose}
              defaultValues={sellTarget ? {
                stockCode: sellTarget.stockCode,
                stockName: sellTarget.stockName,
                type: 'SELL',
                price: '',
                quantity: String(sellTarget.quantity),
                tradedAt: new Date().toISOString().split('T')[0],
              } : undefined}
            />
          </DialogContent>
        </Dialog>
      </div>
      <TradeList onBuyClick={handleBuyClick} />
    </div>
  );
}

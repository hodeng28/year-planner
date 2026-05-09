'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TradeForm } from '@/components/trades/trade-form';
import { TradeList } from '@/components/trades/trade-list';

export default function TradesPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">매매 기록</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            + 매매 등록
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>새 매매 등록</DialogTitle>
            </DialogHeader>
            <TradeForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <TradeList />
    </div>
  );
}

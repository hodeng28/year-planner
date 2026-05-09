'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateTrade } from '@/hooks/use-trades';
import { useEmotions, usePatterns, useStrategies } from '@/hooks/use-options';
import type { Option } from '@/lib/api';

interface TradeFormProps {
  onSuccess?: () => void;
}

export function TradeForm({ onSuccess }: TradeFormProps) {
  const [form, setForm] = useState({
    stockCode: '',
    stockName: '',
    type: 'BUY' as 'BUY' | 'SELL',
    price: '',
    quantity: '',
    tradedAt: new Date().toISOString().split('T')[0],
    emotionId: '',
    patternId: '',
    strategyId: '',
    memo: '',
  });

  const createTrade = useCreateTrade();
  const { data: emotions } = useEmotions();
  const { data: patterns } = usePatterns();
  const { data: strategies } = useStrategies();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTrade.mutate(
      {
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity),
        emotionId: form.emotionId || undefined,
        patternId: form.patternId || undefined,
        strategyId: form.strategyId || undefined,
      },
      { onSuccess }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>종목코드</Label>
          <Input
            value={form.stockCode}
            onChange={(e) => setForm({ ...form, stockCode: e.target.value })}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>종목명</Label>
          <Input
            value={form.stockName}
            onChange={(e) => setForm({ ...form, stockName: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label>매매구분</Label>
          <Select value={form.type} onValueChange={(v) => v && setForm({ ...form, type: v as 'BUY' | 'SELL' })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BUY">매수</SelectItem>
              <SelectItem value="SELL">매도</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>가격</Label>
          <Input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>수량</Label>
          <Input
            type="number"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>매매일</Label>
        <Input
          type="date"
          value={form.tradedAt}
          onChange={(e) => setForm({ ...form, tradedAt: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label>감정</Label>
          <Select value={form.emotionId || null} onValueChange={(v) => setForm({ ...form, emotionId: v ?? '' })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="선택" />
            </SelectTrigger>
            <SelectContent>
              {emotions?.map((e: Option) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>패턴</Label>
          <Select value={form.patternId || null} onValueChange={(v) => setForm({ ...form, patternId: v ?? '' })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="선택" />
            </SelectTrigger>
            <SelectContent>
              {patterns?.map((p: Option) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>전략</Label>
          <Select value={form.strategyId || null} onValueChange={(v) => setForm({ ...form, strategyId: v ?? '' })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="선택" />
            </SelectTrigger>
            <SelectContent>
              {strategies?.map((s: Option) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>메모</Label>
        <Input value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} />
      </div>
      <Button type="submit" className="w-full" disabled={createTrade.isPending}>
        {createTrade.isPending ? '저장 중...' : '매매 등록'}
      </Button>
    </form>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateTrade } from '@/hooks/use-trades';
import { useEmotions, usePatterns, useStrategies } from '@/hooks/use-options';
import type { Option } from '@/lib/api';

interface TradeFormValues {
  stockCode: string;
  stockName: string;
  type: 'BUY' | 'SELL';
  price: string;
  quantity: string;
  tradedAt: string;
  emotionId?: string;
  patternId?: string;
  strategyId?: string;
  memo?: string;
}

interface TradeFormProps {
  onSuccess?: () => void;
  defaultValues?: Partial<TradeFormValues>;
}

const initialForm: TradeFormValues = {
  stockCode: '',
  stockName: '',
  type: 'BUY',
  price: '',
  quantity: '',
  tradedAt: new Date().toISOString().split('T')[0],
  emotionId: '',
  patternId: '',
  strategyId: '',
  memo: '',
};

export function TradeForm({ onSuccess, defaultValues }: TradeFormProps) {
  const [form, setForm] = useState<TradeFormValues>({ ...initialForm, ...defaultValues });

  const createTrade = useCreateTrade();
  const { data: emotions } = useEmotions();
  const { data: patterns } = usePatterns();
  const { data: strategies } = useStrategies();

  // Reset form when defaultValues change
  useEffect(() => {
    setForm({ ...initialForm, ...defaultValues });
  }, [defaultValues]);

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
              <SelectValue>
                {form.type === 'BUY' ? '매수' : '매도'}
              </SelectValue>
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
          <Select value={form.emotionId || '_none_'} onValueChange={(v) => setForm({ ...form, emotionId: v === '_none_' ? '' : v })}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {form.emotionId ? emotions?.find((e: Option) => e.id === form.emotionId)?.name : '선택'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none_">선택 안함</SelectItem>
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
          <Select value={form.patternId || '_none_'} onValueChange={(v) => setForm({ ...form, patternId: v === '_none_' ? '' : v })}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {form.patternId ? patterns?.find((p: Option) => p.id === form.patternId)?.name : '선택'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none_">선택 안함</SelectItem>
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
          <Select value={form.strategyId || '_none_'} onValueChange={(v) => setForm({ ...form, strategyId: v === '_none_' ? '' : v })}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {form.strategyId ? strategies?.find((s: Option) => s.id === form.strategyId)?.name : '선택'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none_">선택 안함</SelectItem>
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
        {createTrade.isPending ? '저장 중...' : form.type === 'SELL' ? '매도 등록' : '매매 등록'}
      </Button>
    </form>
  );
}

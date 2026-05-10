'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEmotions, usePatterns, useStrategies } from '@/hooks/use-options';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface FeeSettings {
  buyCommission: number;
  sellCommission: number;
  transactionTax: number;
}

async function fetchWithData<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = await res.json();
  return json.data;
}

function FeeSettingsCard() {
  const queryClient = useQueryClient();
  const { data: feeSettings, isLoading } = useQuery({
    queryKey: ['settings', 'fees'],
    queryFn: () => fetchWithData<FeeSettings>(`${API_BASE}/settings/fees`),
  });

  const [form, setForm] = useState({
    buyCommission: '0.015',
    sellCommission: '0.015',
    transactionTax: '0.20',
  });

  useEffect(() => {
    if (feeSettings) {
      setForm({
        buyCommission: (feeSettings.buyCommission * 100).toFixed(4),
        sellCommission: (feeSettings.sellCommission * 100).toFixed(4),
        transactionTax: (feeSettings.transactionTax * 100).toFixed(2),
      });
    }
  }, [feeSettings]);

  const updateMutation = useMutation({
    mutationFn: async (data: FeeSettings) => {
      const res = await fetch(`${API_BASE}/settings/fees`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'fees'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      buyCommission: parseFloat(form.buyCommission) / 100,
      sellCommission: parseFloat(form.sellCommission) / 100,
      transactionTax: parseFloat(form.transactionTax) / 100,
    });
  };

  if (isLoading) return <Card><CardContent className="p-6">로딩 중...</CardContent></Card>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>수수료 설정</CardTitle>
        <CardDescription>미래에셋증권 기본: 매매수수료 0.015%, 거래세 0.20%</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>매수 수수료 (%)</Label>
              <Input
                type="number"
                step="0.0001"
                value={form.buyCommission}
                onChange={(e) => setForm({ ...form, buyCommission: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>매도 수수료 (%)</Label>
              <Input
                type="number"
                step="0.0001"
                value={form.sellCommission}
                onChange={(e) => setForm({ ...form, sellCommission: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>거래세 (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.transactionTax}
                onChange={(e) => setForm({ ...form, transactionTax: e.target.value })}
              />
            </div>
          </div>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? '저장 중...' : '저장'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function OptionSection({ title, queryKey, endpoint, useHook }: { title: string; queryKey: string; endpoint: string; useHook: () => any }) {
  const [newName, setNewName] = useState('');
  const queryClient = useQueryClient();
  const { data: options } = useHook();

  const addMutation = useMutation({
    mutationFn: (name: string) =>
      fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setNewName('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`${API_BASE}${endpoint}/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] }),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="새 옵션 추가" />
          <Button onClick={() => addMutation.mutate(newName)} disabled={!newName}>
            추가
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {options?.map((opt: any) => (
            <Badge key={opt.id} variant="secondary" className="gap-1">
              {opt.name}
              {!opt.isDefault && (
                <button onClick={() => deleteMutation.mutate(opt.id)} className="ml-1 hover:text-red-500">
                  ×
                </button>
              )}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">설정</h2>
      <FeeSettingsCard />
      <OptionSection title="감정 옵션" queryKey="emotions" endpoint="/options/emotions" useHook={useEmotions} />
      <OptionSection title="패턴 옵션" queryKey="patterns" endpoint="/options/patterns" useHook={usePatterns} />
      <OptionSection title="전략 옵션" queryKey="strategies" endpoint="/options/strategies" useHook={useStrategies} />
    </div>
  );
}
